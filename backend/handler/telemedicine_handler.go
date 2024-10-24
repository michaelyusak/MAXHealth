package handler

import (
	"strconv"

	"max-health/appconstant"
	"max-health/apperror"
	"max-health/dto"
	"max-health/usecase"
	"max-health/util"

	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
)

type TelemedicineHandler struct {
	telemedicineUsecase usecase.TelemedicineUsecase
}

func NewTelemedicineHandler(telemedicineUsecase usecase.TelemedicineUsecase) TelemedicineHandler {
	return TelemedicineHandler{
		telemedicineUsecase: telemedicineUsecase,
	}
}

func (h *TelemedicineHandler) SavePrescription(ctx *gin.Context) {
	ctx.Header("Content-Type", "application/json")

	accountId, exists := ctx.Get(appconstant.AccountId)
	if !exists {
		ctx.Error(apperror.UnauthorizedError())
		return
	}

	prescriptionIdString := ctx.Param(appconstant.PrescriptionIdString)

	prescriptionId, err := strconv.Atoi(prescriptionIdString)
	if err != nil {
		ctx.Error(apperror.PrescriptionIdNotANumberError())
		return
	}

	err = h.telemedicineUsecase.SavePrescription(ctx.Request.Context(), accountId.(int64), int64(prescriptionId))
	if err != nil {
		ctx.Error(err)
		return
	}

	util.ResponseOK(ctx, nil)
}

func (h *TelemedicineHandler) GetAllPrescriptions(ctx *gin.Context) {
	ctx.Header("Content-Type", "application/json")

	accountId, exists := ctx.Get(appconstant.AccountId)
	if !exists {
		ctx.Error(apperror.UnauthorizedError())
		return
	}

	limit := ctx.Query(appconstant.Limit)
	page := ctx.Query(appconstant.Page)

	prescriptionList, err := h.telemedicineUsecase.GetAllPrescriptions(ctx.Request.Context(), accountId.(int64), limit, page)
	if err != nil {
		ctx.Error(err)
		return
	}

	util.ResponseOK(ctx, prescriptionList)
}

func (h *TelemedicineHandler) PreapereForCheckout(ctx *gin.Context) {
	ctx.Header("Content-Type", "application/json")

	accountId, exists := ctx.Get(appconstant.AccountId)
	if !exists {
		ctx.Error(apperror.UnauthorizedError())
		return
	}

	prescriptionIdString := ctx.Param(appconstant.PrescriptionIdString)
	addressId := ctx.Query(appconstant.AddressIdString)

	prescriptionId, err := strconv.Atoi(prescriptionIdString)
	if err != nil {
		ctx.Error(apperror.PrescriptionIdNotANumberError())
		return
	}

	nearestPharmacyDrugList, err := h.telemedicineUsecase.PrepareForCheckout(ctx.Request.Context(), accountId.(int64), int64(prescriptionId), addressId)
	if err != nil {
		ctx.Error(err)
		return
	}

	util.ResponseOK(ctx, *nearestPharmacyDrugList)
}

func (h *TelemedicineHandler) CheckoutFromPrescription(ctx *gin.Context) {
	ctx.Header("Content-Type", "application/json")

	accountId, exists := ctx.Get(appconstant.AccountId)
	if !exists {
		ctx.Error(apperror.UnauthorizedError())
		return
	}

	var checkoutFromPrescriptionRequest dto.CheckoutFromPrescriptionRequest

	err := ctx.ShouldBindJSON(&checkoutFromPrescriptionRequest)
	if err != nil {
		ctx.Error(err)
		return
	}

	for _, request := range checkoutFromPrescriptionRequest.Pharmacies {
		err = validator.New().Struct(request)
		if err != nil {
			ctx.Error(err)
			return
		}

		for _, pharmacyDrugQuantity := range request.PharmacyDrugs {
			err = validator.New().Struct(pharmacyDrugQuantity)
			if err != nil {
				ctx.Error(err)
				return
			}
		}
	}

	checkoutFromPrescriptionRequest.AccountId = accountId.(int64)

	orderId, err := h.telemedicineUsecase.CheckoutFromPrescription(ctx.Request.Context(), checkoutFromPrescriptionRequest)
	if err != nil {
		ctx.Error(err)
		return
	}

	util.ResponseOK(ctx, dto.OrderCheckoutResponse{OrderId: *orderId})
}
