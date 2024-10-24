package usecase

import (
	"context"
	"math"
	"strconv"

	"max-health/apperror"
	"max-health/dto"
	"max-health/entity"
	"max-health/repository"
	"max-health/util"

	"github.com/shopspring/decimal"
)

type TelemedicineUsecase interface {
	SavePrescription(ctx context.Context, accountId, prescriptionId int64) error
	GetAllPrescriptions(ctx context.Context, accountId int64, limit, page string) (*dto.PrescriptionResponseList, error)
	PrepareForCheckout(ctx context.Context, accountId, prescriptionId int64, addressIdString string) (*dto.PreapareForCheckoutResponse, error)
	CheckoutFromPrescription(ctx context.Context, checkoutFromPrescriptionRequest dto.CheckoutFromPrescriptionRequest) (*int64, error)
}

type telemedicineUsecaseImpl struct {
	userRepository             repository.UserRepository
	doctorRepository           repository.DoctorRepository
	pharmacyDrugRepository     repository.PharmacyDrugRepository
	prescriptionDrugRepository repository.PrescriptionDrugRepository
	prescriptionRepository     repository.PrescriptionRepository
	cartRepository             repository.CartRepository
	orderRepository            repository.OrderRepository
	userAddressRepository      repository.UserAddressRepository
	pharmacyRepository         repository.PharmacyRepository
	transaction                repository.Transaction
}

func NewTelemedicineUsecaseImpl(userRepository repository.UserRepository, doctorRepository repository.DoctorRepository, pharmacyDrugRepository repository.PharmacyDrugRepository, prescriptionDrugRepository repository.PrescriptionDrugRepository, prescriptionRepository repository.PrescriptionRepository, cartRepository repository.CartRepository, orderRepository repository.OrderRepository, userAddressRepository repository.UserAddressRepository, pharmacyRepository repository.PharmacyRepository, transaction repository.Transaction) telemedicineUsecaseImpl {
	return telemedicineUsecaseImpl{
		userRepository:             userRepository,
		doctorRepository:           doctorRepository,
		pharmacyDrugRepository:     pharmacyDrugRepository,
		prescriptionDrugRepository: prescriptionDrugRepository,
		prescriptionRepository:     prescriptionRepository,
		cartRepository:             cartRepository,
		orderRepository:            orderRepository,
		userAddressRepository:      userAddressRepository,
		pharmacyRepository:         pharmacyRepository,
		transaction:                transaction,
	}
}

func (u *telemedicineUsecaseImpl) SavePrescription(ctx context.Context, accountId, prescriptionId int64) error {
	prescription, err := u.prescriptionRepository.GetPrescriptionById(ctx, prescriptionId)
	if err != nil {
		return apperror.InternalServerError(err)
	}

	if prescription == nil {
		return apperror.InvalidPrescriptionIdError()
	}

	if prescription.RedeemedAt != nil {
		return apperror.PrescriptionHasBeenRedeemedError()
	}

	if prescription.UserAccountId != accountId {
		return apperror.InvalidPrescriptionIdError()
	}

	err = u.prescriptionRepository.SetPrescriptionRedeemedNow(ctx, *prescription.Id)
	if err != nil {
		return apperror.InternalServerError(err)
	}

	return nil
}

func (u *telemedicineUsecaseImpl) GetAllPrescriptions(ctx context.Context, accountId int64, limit, page string) (*dto.PrescriptionResponseList, error) {
	limitInt, offsetInt, err := util.CheckPharmacyDrugPagination(page, limit)
	if err != nil {
		return nil, err
	}

	prescriptionList, err := u.prescriptionRepository.GetPrescriptionListByUserAccountId(ctx, accountId, limitInt, offsetInt)
	if err != nil {
		return nil, apperror.InternalServerError(err)
	}

	totalItem, err := u.prescriptionRepository.GetPrescriptionListByUserAccountIdTotalItem(ctx, accountId)
	if err != nil {
		return nil, apperror.InternalServerError(err)
	}

	totalPage := math.Ceil(float64(totalItem) / float64(limitInt))

	for i, prescription := range prescriptionList {
		prescriptionDrugs, err := u.prescriptionDrugRepository.GetAllPrescriptionDrug(ctx, *prescription.Id)
		if err != nil {
			return nil, apperror.InternalServerError(err)
		}

		prescriptionList[i].PrescriptionDrugs = prescriptionDrugs
	}

	response := dto.ConvertToPrescriptionResponseList(prescriptionList, totalItem, int(totalPage))

	return &response, nil
}

func (u *telemedicineUsecaseImpl) PrepareForCheckout(ctx context.Context, accountId, prescriptionId int64, addressIdString string) (*dto.PreapareForCheckoutResponse, error) {
	if prescriptionId < 1 {
		return nil, apperror.PrescriptionIdNotANumberError()
	}

	prescription, err := u.prescriptionRepository.GetPrescriptionById(ctx, prescriptionId)
	if err != nil {
		return nil, apperror.InternalServerError(err)
	}

	addressId, err := strconv.Atoi(addressIdString)
	if err != nil {
		return nil, apperror.AddressIdInvalidError()
	}

	if prescription.OrderedAt != nil {
		return nil, apperror.PrescriptionHasBeenUsedError()
	}

	userCredential, err := u.userRepository.FindUserByAccountId(ctx, accountId)
	if err != nil {
		return nil, apperror.InternalServerError(err)
	}

	userIdFromAddress, err := u.userAddressRepository.FindOneUserAddressById(ctx, int64(addressId))
	if err != nil {
		return nil, apperror.InternalServerError(err)
	}

	if userCredential.Id != *userIdFromAddress {
		return nil, apperror.ForbiddenAction()
	}

	userAddress, err := u.userAddressRepository.GetOneUserAddressByAddressId(ctx, int64(addressId))
	if err != nil {
		return nil, apperror.InternalServerError(err)
	}

	userAddress.Id = int64(addressId)

	prescriptionDrugList, err := u.prescriptionDrugRepository.GetAllPrescriptionDrug(ctx, prescriptionId)
	if err != nil {
		return nil, apperror.InternalServerError(err)
	}

	var checkoutPreparation entity.PrepareForCheckout

	checkoutPreparation.UserAddress = *userAddress

out:
	for _, prescriptionDrug := range prescriptionDrugList {
		if !prescriptionDrug.Drug.IsActive {
			return nil, apperror.DrugIsInactiveError()
		}

		pharmacy, drugQuantity, err := u.pharmacyDrugRepository.GetNearestAvailablePharmacyDrugByDrugId(ctx, prescriptionDrug.Drug.Id, userAddress.Id)
		if err != nil {
			return nil, apperror.InternalServerError(err)
		}

		if pharmacy == nil || drugQuantity == nil {
			return nil, apperror.NoDrugNearby()
		}

		for i, pharmacyDrug := range checkoutPreparation.Items {
			if pharmacyDrug.PharmacyId == pharmacy.Id {
				drugQuantity.Quantity = prescriptionDrug.Quantity
				checkoutPreparation.Items[i].DrugQuantities = append(checkoutPreparation.Items[i].DrugQuantities, *drugQuantity)
				checkoutPreparation.Items[i].Subtotal = checkoutPreparation.Items[i].Subtotal.Add(decimal.NewFromInt(int64(drugQuantity.Quantity)).Mul(drugQuantity.PharmacyDrug.Price))
				checkoutPreparation.Items[i].Weight = checkoutPreparation.Items[i].Weight.Add(decimal.NewFromInt(int64(prescriptionDrug.Quantity)).Mul(drugQuantity.PharmacyDrug.Drug.Weight))

				continue out
			}
		}

		weight := decimal.NewFromInt(int64(prescriptionDrug.Quantity)).Mul(drugQuantity.PharmacyDrug.Drug.Weight)

		avaiableCourierList, err := u.pharmacyRepository.GetAllCourierOptionsByPharmacyId(ctx, userAddress.Id, pharmacy.Id, weight.InexactFloat64())
		if err != nil {
			return nil, apperror.InternalServerError(err)
		}

		drugQuantity.Quantity = prescriptionDrug.Quantity
		nearestPharmacyDrug := entity.PrepareForCheckoutItem{
			PharmacyId:      pharmacy.Id,
			PharmacyName:    pharmacy.Name,
			PharmacyAddress: pharmacy.Address,
			Distance:        pharmacy.Distance,
			DeliveryOptions: avaiableCourierList,
			Subtotal:        decimal.NewFromInt(int64(prescriptionDrug.Quantity)).Mul(drugQuantity.PharmacyDrug.Price),
			Weight:          weight,
			DrugQuantities:  []entity.DrugQuantity{*drugQuantity},
		}

		checkoutPreparation.Items = append(checkoutPreparation.Items, nearestPharmacyDrug)
	}

	response := dto.ConvertPrepareForCheckoutToResponse(checkoutPreparation.Items)

	return &response, nil
}

func (u *telemedicineUsecaseImpl) CheckoutFromPrescription(ctx context.Context, checkoutFromPrescriptionRequest dto.CheckoutFromPrescriptionRequest) (*int64, error) {
	user, err := u.userRepository.FindUserByAccountId(ctx, checkoutFromPrescriptionRequest.AccountId)
	if err != nil {
		return nil, apperror.InternalServerError(err)
	}
	if user == nil {
		return nil, apperror.UserNotFoundError()
	}

	prescription, err := u.prescriptionRepository.GetPrescriptionById(ctx, checkoutFromPrescriptionRequest.PrescriptionId)
	if err != nil {
		return nil, apperror.InternalServerError(err)
	}

	if prescription.OrderedAt != nil {
		return nil, apperror.PrescriptionHasBeenUsedError()
	}

	tx, err := u.transaction.BeginTx()
	if err != nil {
		return nil, apperror.InternalServerError(err)
	}

	orderRepo := tx.OrderRepository()
	cartRepo := tx.CartRepository()
	orderPharmacyRepo := tx.OrderPharmacyRepository()
	orderItemRepo := tx.OrderItemRepository()
	pharmacyDrugRepo := tx.PharmacyDrugRepo()
	stockChangeRepo := tx.StockChangeRepo()
	stockMutationRepo := tx.StockMutationRepo()
	prescriptionRepo := tx.PrescriptionRepository()

	defer func() {
		if err != nil {
			tx.Rollback()
		}

		tx.Commit()
	}()

	orderCheckoutRequest := dto.ConvertPrescriptionCheckoutRequest(checkoutFromPrescriptionRequest)

	for i, pharmacy := range checkoutFromPrescriptionRequest.Pharmacies {
		var cartItemIds []int64

		for _, phamacyDrugQuantity := range pharmacy.PharmacyDrugs {
			cartItemId, err := cartRepo.PostOneCart(ctx, checkoutFromPrescriptionRequest.AccountId, phamacyDrugQuantity.PharmacyDrugId, phamacyDrugQuantity.Quantity)
			if err != nil {
				return nil, apperror.InternalServerError(err)
			}

			cartItemIds = append(cartItemIds, *cartItemId)
		}

		orderCheckoutRequest.Pharmacies[i].CartItemIds = cartItemIds
	}

	orderId, err := orderRepo.PostOneOrder(ctx, user.Id, checkoutFromPrescriptionRequest.Address, checkoutFromPrescriptionRequest.TotalAmount)
	if err != nil {
		return nil, apperror.InternalServerError(err)
	}

	orderPharmacies, err := orderPharmacyRepo.PostOrderPharmacies(ctx, orderId, orderCheckoutRequest)
	if err != nil {
		return nil, apperror.InternalServerError(err)
	}

	for i, pharmacy := range orderCheckoutRequest.Pharmacies {
		orderPharmacies[i].CartItems, err = cartRepo.GetAllCartDetailByIds(ctx, pharmacy.CartItemIds)
		if err != nil {
			return nil, apperror.InternalServerError(err)
		}
	}

	err = orderItemRepo.PostOrderItems(ctx, orderPharmacies)
	if err != nil {
		return nil, apperror.InternalServerError(err)
	}

	allCartItems := []entity.CartItemForCheckout{}
	for _, pharmacy := range orderPharmacies {
		allCartItems = append(allCartItems, pharmacy.CartItems...)
	}

	err = pharmacyDrugRepo.GetPharmacyDrugsByCartForUpdate(ctx, allCartItems)
	if err != nil {
		return nil, apperror.InternalServerError(err)
	}

	carts, err := cartRepo.GetAllCartsForChangesByCartIds(ctx, allCartItems)
	if err != nil {
		return nil, apperror.InternalServerError(err)
	}

	err = stockChangeRepo.PostStockChangesByCartIds(ctx, carts)
	if err != nil {
		return nil, apperror.InternalServerError(err)
	}

	pharmacyDrugs, err := pharmacyDrugRepo.UpdatePharmacyDrugsByCartId(ctx, allCartItems)
	if err != nil {
		return nil, apperror.InternalServerError(err)
	}

	alternatives, err := stockMutationRepo.GetPossibleStockMutation(ctx, allCartItems)
	if err != nil {
		return nil, apperror.InternalServerError(err)
	}

	stockMutationList := []entity.PossibleStockMutation{}
	stockChangesList := []entity.StockChange{}
	insufficientCartItems := []int64{}
	for _, pharmacyDrug := range pharmacyDrugs {
		if pharmacyDrug.Stock >= 0 {
			continue
		}
		stock := pharmacyDrug.Stock
		for _, alternative := range alternatives {
			if alternative.CartItemId != pharmacyDrug.CartId {
				continue
			}
			if stock+alternative.AlternativeStock < 0 {
				stock += alternative.AlternativeStock
				stockMutationList = append(stockMutationList, alternative)
				stockChangesList = append(stockChangesList, entity.StockChange{PharmacyDrugId: alternative.OriginalPharmacyDrug,
					FinalStock: stock, Amount: alternative.AlternativeStock})
				stockChangesList = append(stockChangesList, entity.StockChange{PharmacyDrugId: alternative.AlternativePharmacy,
					FinalStock: 0, Amount: -1 * alternative.AlternativeStock})
			} else {
				partialAlternative := alternative
				partialAlternative.AlternativeStock = stock * -1
				stockMutationList = append(stockMutationList, partialAlternative)
				stockChangesList = append(stockChangesList, entity.StockChange{PharmacyDrugId: alternative.OriginalPharmacyDrug,
					FinalStock: 0, Amount: partialAlternative.AlternativeStock})
				stockChangesList = append(stockChangesList, entity.StockChange{PharmacyDrugId: alternative.AlternativePharmacy,
					FinalStock: alternative.AlternativeStock - partialAlternative.AlternativeStock,
					Amount:     -1 * partialAlternative.AlternativeStock})
				stock = 0
				break
			}
		}
		if stock < 0 {
			insufficientCartItems = append(insufficientCartItems, pharmacyDrug.CartId)
		}
	}

	if len(insufficientCartItems) > 0 {
		err = apperror.InsufficientStockDuringCheckoutError(insufficientCartItems)
		return nil, err
	}

	if len(stockMutationList) > 0 {
		err = stockMutationRepo.PostStockMutations(ctx, stockMutationList)
		if err != nil {
			return nil, apperror.InternalServerError(err)
		}

		err = stockChangeRepo.PostStockChangesFromMutation(ctx, stockChangesList)
		if err != nil {
			return nil, apperror.InternalServerError(err)
		}

		err = pharmacyDrugRepo.UpdatePharmacyDrugsForStockMutation(ctx, stockChangesList)
		if err != nil {
			return nil, apperror.InternalServerError(err)
		}
	}

	err = cartRepo.DeleteCarts(ctx, allCartItems)
	if err != nil {
		return nil, apperror.InternalServerError(err)
	}

	err = prescriptionRepo.SetPrescriptionOrderedAtNow(ctx, *prescription.Id)
	if err != nil {
		return nil, apperror.InternalServerError(err)
	}

	return &orderId, nil
}
