package repository

import (
	"context"
	"database/sql"
	"fmt"
	"strconv"
	"time"

	"max-health/database"
	"max-health/entity"
	"max-health/util"

	"github.com/shopspring/decimal"
)

type PharmacyDrugRepository interface {
	GetPharmacyDrugsByDrugId(ctx context.Context, drugId int64, latitude, longitude float64, limit, offset int) ([]entity.PharmacyDrug, error)
	GetPharmacyDrugById(ctx context.Context, pharmacyDrugId int64) (*entity.PharmacyDrugDetail, error)
	GetProductListing(ctx context.Context, query *util.ValidatedGetProductQuery) ([]entity.DrugListing, *entity.PageInfo, error)
	GetPharmacyDrugsByCartForUpdate(ctx context.Context, cartItems []entity.CartItemForCheckout) error
	UpdatePharmacyDrugsByCartId(ctx context.Context, cartItems []entity.CartItemForCheckout) ([]entity.PharmacyDrugAndCartId, error)
	UpdatePharmacyDrugsForStockMutation(ctx context.Context, stockChangesList []entity.StockChange) error
	GetPharmacyDrugByPharmacyId(ctx context.Context, pharmacyId int64) ([]entity.PharmacyDrugDetail, error)
	GetNearestAvailablePharmacyDrugByDrugId(ctx context.Context, drugId, userAddressId int64) (*entity.Pharmacy, *entity.DrugQuantity, error)
	UpdatePharmacyDrugsByOrderPharmacyId(ctx context.Context, orderPharmacyId int64) ([]entity.StockChange, error)
	UpdatePharmacyDrugsByOrderId(ctx context.Context, orderId int64) ([]entity.StockChange, error)
	UpdatePharmacyDrugStockPrice(ctx context.Context, pharmacyDrugId int64, stock int, Price decimal.Decimal) error
	DeletePharmacyDrug(ctx context.Context, pharmacyDrugId int64) error
	AddPharmacyDrug(ctx context.Context, pharmacyId int64, drugId int64, stock int, price decimal.Decimal) error
	GetPossibleStockMutation(ctx context.Context, pharmacyDrugId int64) ([]entity.PharmacyDrugDetail, error)
	GetPharmacyDrugByIdForUpdate(ctx context.Context, pharmacyDrugId int64) (*entity.PharmacyDrugDetail, error)
}

type pharmacyDrugRepositoryPostgres struct {
	db DBTX
}

func NewDrugPharmacyRepositoryPostgres(db *sql.DB) pharmacyDrugRepositoryPostgres {
	return pharmacyDrugRepositoryPostgres{
		db: db,
	}
}

func (r *pharmacyDrugRepositoryPostgres) GetPharmacyDrugsByDrugId(ctx context.Context, drugId int64, latitude, longitude float64, limit, offset int) ([]entity.PharmacyDrug, error) {
	rows, err := r.db.QueryContext(ctx, database.GetPharmacyDrugByDrugIdQuery, drugId, longitude, latitude, limit, offset)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var pharmacyDrugList []entity.PharmacyDrug

	for rows.Next() {
		var pharmacyDrug entity.PharmacyDrug

		err := rows.Scan(
			&pharmacyDrug.Id,
			&pharmacyDrug.Pharmacy.Id,
			&pharmacyDrug.Pharmacy.Name,
			&pharmacyDrug.Pharmacy.PharmacistName,
			&pharmacyDrug.Pharmacy.PharmacistLicenseNumber,
			&pharmacyDrug.Pharmacy.PharmacistPhoneNumber,
			&pharmacyDrug.Pharmacy.Distance,
			&pharmacyDrug.DrugId,
			&pharmacyDrug.Price,
			&pharmacyDrug.Stock,
		)
		if err != nil {
			return nil, err
		}

		pharmacyDrugList = append(pharmacyDrugList, pharmacyDrug)
	}

	return pharmacyDrugList, nil
}

func (r *pharmacyDrugRepositoryPostgres) GetPharmacyDrugById(ctx context.Context, pharmacyDrugId int64) (*entity.PharmacyDrugDetail, error) {
	pharmacyDrug := entity.PharmacyDrugDetail{}
	err := r.db.QueryRowContext(ctx, database.GetPharmacyDrugById, pharmacyDrugId).Scan(&pharmacyDrug.Id, &pharmacyDrug.PharmacyId, &pharmacyDrug.DrugId, &pharmacyDrug.Price, &pharmacyDrug.Stock)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}

		return nil, err
	}
	return &pharmacyDrug, nil
}

func (r *pharmacyDrugRepositoryPostgres) GetProductListing(ctx context.Context, query *util.ValidatedGetProductQuery) ([]entity.DrugListing, *entity.PageInfo, error) {
	sql := database.GetPharmacyInRangeQuery
	args := []interface{}{}
	args = append(args, query.Longitude)
	args = append(args, query.Latitude)

	sql += `), ` + database.GetDrugListQuery

	if query.Search != nil {
		sql += `$` + strconv.Itoa(len(args)+1)
		args = append(args, "%"+*query.Search+"%")
	} else {
		sql += `'%%'`
	}

	if query.Category != nil {
		sql += ` AND drug_category_id = $` + strconv.Itoa(len(args)+1)
		args = append(args, *query.Category)
	}

	if query.MinPrice != nil {
		sql += ` AND price >= $` + strconv.Itoa(len(args)+1)
		args = append(args, *query.MinPrice)
	}

	if query.MaxPrice != nil {
		sql += ` AND price <= $` + strconv.Itoa(len(args)+1)
		args = append(args, *query.MaxPrice)
	}
	sql += database.GetDrugListFilterQuery
	sql += `), ` + database.GetPriceRangeQuery

	sql += database.GetProductListingQuery + ` ORDER BY min_price`

	if query.Sort != nil {
		if *query.Sort == "desc" {
			sql += ` DESC`
		} else {
			sql += ` ASC`
		}
	} else {
		sql += ` ASC`
	}
	sql += ` LIMIT $` + strconv.Itoa(len(args)+1)
	args = append(args, query.Limit)
	sql += ` OFFSET $` + strconv.Itoa(len(args)+1)
	args = append(args, (query.Limit * (query.Page - 1)))

	c, cancel := context.WithTimeout(ctx, 30*time.Second)
	defer cancel()

	rows, err := r.db.QueryContext(c, sql, args...)
	if err != nil {
		return nil, nil, fmt.Errorf("[pharmacy_drug_repository][GetProductListing][db.QueryContext] Error: %w", err)
	}
	defer rows.Close()

	pageInfo := entity.PageInfo{}
	drugListing := []entity.DrugListing{}

	for rows.Next() {
		drug := entity.DrugListing{}
		err := rows.Scan(
			&pageInfo.ItemCount,
			&drug.PharmacyDrugId,
			&drug.DrugId,
			&drug.Name,
			&drug.MinPrice,
			&drug.MaxPrice,
			&drug.Image,
			&drug.IsPrescriptionRequired)
		if err != nil {
			return nil, nil, fmt.Errorf("[pharmacy_drug_repository][GetProductListing][rows.Scan] Error: %w", err)
		}
		drugListing = append(drugListing, drug)
	}

	pageInfo.Page = query.Page
	pageInfo.PageCount = pageInfo.ItemCount / query.Limit
	if pageInfo.ItemCount%query.Limit != 0 {
		pageInfo.PageCount += 1
	}

	return drugListing, &pageInfo, nil
}

func (r *pharmacyDrugRepositoryPostgres) GetPharmacyDrugsByCartForUpdate(ctx context.Context, cartItems []entity.CartItemForCheckout) error {
	query := database.GetPharmacyDrugsByCartForUpdate
	args := []interface{}{}
	if len(cartItems) > 0 {
		query += `WHERE `
	}
	for i, cartItem := range cartItems {
		query += `ci.cart_item_id = $` + strconv.Itoa(len(args)+1)
		args = append(args, cartItem.Id)
		if i != len(cartItems)-1 {
			query += ` OR `
		}
	}
	query += ` FOR UPDATE`
	_, err := r.db.ExecContext(ctx, query, args...)
	if err != nil {
		return err
	}
	return nil
}

func (r *pharmacyDrugRepositoryPostgres) UpdatePharmacyDrugsByCartId(ctx context.Context, cartItems []entity.CartItemForCheckout) ([]entity.PharmacyDrugAndCartId, error) {
	query := database.UpdatePharmacyDrugsByCartId
	pharmacyDrugs := []entity.PharmacyDrugAndCartId{}
	args := []interface{}{}
	if len(cartItems) > 0 {
		query += `AND (`
	}
	for i, cartItem := range cartItems {
		query += `ci.cart_item_id = $` + strconv.Itoa(len(args)+1)
		args = append(args, cartItem.Id)
		if i != len(cartItems)-1 {
			query += ` OR `
		}
	}
	query += `)`
	query += `RETURNING ci.cart_item_id, pd.pharmacy_drug_id, pd.stock`

	rows, err := r.db.QueryContext(ctx, query, args...)
	if err != nil {
		return pharmacyDrugs, err
	}
	defer rows.Close()

	for rows.Next() {
		var pharmacyDrug entity.PharmacyDrugAndCartId
		err := rows.Scan(&pharmacyDrug.CartId, &pharmacyDrug.PharmacyDrugId, &pharmacyDrug.Stock)
		if err != nil {
			return []entity.PharmacyDrugAndCartId{}, err
		}
		pharmacyDrugs = append(pharmacyDrugs, pharmacyDrug)
	}
	return pharmacyDrugs, nil
}

func (r *pharmacyDrugRepositoryPostgres) UpdatePharmacyDrugsForStockMutation(ctx context.Context, stockChangesList []entity.StockChange) error {
	query := database.UpdatePharmacyDrugsFromStockMutation1
	for i, stockChange := range stockChangesList {
		query += `(` + strconv.Itoa(int(stockChange.PharmacyDrugId)) + `, ` + strconv.Itoa(int(stockChange.FinalStock)) + `)`
		if i != len(stockChangesList)-1 {
			query += `, `
		}
	}
	query += database.UpdatePharmacyDrugsFromStockMutation2
	_, err := r.db.ExecContext(ctx, query)
	if err != nil {
		return err
	}
	return nil
}

func (r *pharmacyDrugRepositoryPostgres) GetPharmacyDrugByPharmacyId(ctx context.Context, pharmacyId int64) ([]entity.PharmacyDrugDetail, error) {
	pharmaciesDrug := []entity.PharmacyDrugDetail{}
	rows, err := r.db.QueryContext(ctx, database.GetPharmacyDrugByPharmacyId, pharmacyId)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}

		return nil, err
	}
	defer rows.Close()

	for rows.Next() {
		pharmacyDrug := entity.PharmacyDrugDetail{}

		err := rows.Scan(&pharmacyDrug.Id, &pharmacyDrug.PharmacyId, &pharmacyDrug.DrugId, &pharmacyDrug.Price, &pharmacyDrug.Stock)
		if err != nil {
			return nil, err
		}
		pharmaciesDrug = append(pharmaciesDrug, pharmacyDrug)
	}

	return pharmaciesDrug, nil
}

func (r *pharmacyDrugRepositoryPostgres) GetNearestAvailablePharmacyDrugByDrugId(ctx context.Context, drugId, userAddressId int64) (*entity.Pharmacy, *entity.DrugQuantity, error) {
	var pharmacy entity.Pharmacy
	var drugQuantity entity.DrugQuantity

	err := r.db.QueryRowContext(ctx, database.GetNearestAvailablePharmacyDrugByDrugIdQuery, drugId, userAddressId).Scan(
		&pharmacy.Id,
		&pharmacy.Name,
		&pharmacy.Address,
		&pharmacy.Distance,
		&drugQuantity.PharmacyDrug.Id,
		&drugQuantity.PharmacyDrug.Drug.Id,
		&drugQuantity.PharmacyDrug.Drug.Name,
		&drugQuantity.PharmacyDrug.Drug.Manufacture,
		&drugQuantity.PharmacyDrug.Drug.Image,
		&drugQuantity.PharmacyDrug.Drug.Weight,
		&drugQuantity.PharmacyDrug.Drug.SellingUnit,
		&drugQuantity.PharmacyDrug.Drug.UnitInPack,
		&drugQuantity.PharmacyDrug.Price,
	)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil, nil
		}

		return nil, nil, err
	}

	return &pharmacy, &drugQuantity, nil
}

func (r *pharmacyDrugRepositoryPostgres) UpdatePharmacyDrugsByOrderPharmacyId(ctx context.Context, orderPharmacyId int64) ([]entity.StockChange, error) {
	stockChanges := []entity.StockChange{}
	query := database.GetPharmacyDrugsByOrderPharmacyId + database.UpdatePharmacyDrugsByOrderPharmacyId
	rows, err := r.db.QueryContext(ctx, query, orderPharmacyId)
	if err != nil {
		return stockChanges, err
	}
	defer rows.Close()

	for rows.Next() {
		var stockChange entity.StockChange
		err = rows.Scan(&stockChange.PharmacyDrugId, &stockChange.FinalStock, &stockChange.Amount)
		if err != nil {
			return []entity.StockChange{}, err
		}
		stockChanges = append(stockChanges, stockChange)
	}
	return stockChanges, nil
}

func (r *pharmacyDrugRepositoryPostgres) UpdatePharmacyDrugsByOrderId(ctx context.Context, orderId int64) ([]entity.StockChange, error) {
	stockChanges := []entity.StockChange{}
	query := database.GetPharmacyDrugsByOrderId + database.UpdatePharmacyDrugsByOrderPharmacyId
	rows, err := r.db.QueryContext(ctx, query, orderId)
	if err != nil {
		return stockChanges, err
	}
	defer rows.Close()

	for rows.Next() {
		var stockChange entity.StockChange
		err = rows.Scan(&stockChange.PharmacyDrugId, &stockChange.FinalStock, &stockChange.Amount)
		if err != nil {
			return []entity.StockChange{}, err
		}
		stockChanges = append(stockChanges, stockChange)
	}
	return stockChanges, nil
}

func (r *pharmacyDrugRepositoryPostgres) UpdatePharmacyDrugStockPrice(ctx context.Context, pharmacyDrugId int64, stock int, Price decimal.Decimal) error {
	query := database.UpdatePharmacyDrugStockPrice

	_, err := r.db.ExecContext(ctx, query, pharmacyDrugId, stock, Price)
	if err != nil {
		return err
	}
	return nil
}

func (r *pharmacyDrugRepositoryPostgres) DeletePharmacyDrug(ctx context.Context, pharmacyDrugId int64) error {
	query := database.DeletePharmacyDrug

	_, err := r.db.ExecContext(ctx, query, pharmacyDrugId)
	if err != nil {
		return err
	}
	return nil
}

func (r *pharmacyDrugRepositoryPostgres) AddPharmacyDrug(ctx context.Context, pharmacyId int64, drugId int64, stock int, price decimal.Decimal) error {
	query := database.AddPharmacyDrug

	_, err := r.db.ExecContext(ctx, query, pharmacyId, drugId, stock, price)
	if err != nil {
		return err
	}
	return nil
}

func (r *pharmacyDrugRepositoryPostgres) GetPossibleStockMutation(ctx context.Context, pharmacyDrugId int64) ([]entity.PharmacyDrugDetail, error) {
	query := database.GetPossibleStockMutation
	pharmacyDrugs := []entity.PharmacyDrugDetail{}

	rows, err := r.db.QueryContext(ctx, query, pharmacyDrugId)
	if err != nil {
		return pharmacyDrugs, err
	}
	for rows.Next() {
		var tempDrug entity.PharmacyDrugDetail
		err := rows.Scan(&tempDrug.Id, &tempDrug.PharmacyId, &tempDrug.PharmacyName, &tempDrug.PharmacyAddress, &tempDrug.Stock)
		if err != nil {
			return nil, err
		}
		pharmacyDrugs = append(pharmacyDrugs, tempDrug)
	}
	return pharmacyDrugs, nil
}

func (r *pharmacyDrugRepositoryPostgres) GetPharmacyDrugByIdForUpdate(ctx context.Context, pharmacyDrugId int64) (*entity.PharmacyDrugDetail, error) {
	pharmacyDrug := entity.PharmacyDrugDetail{}
	err := r.db.QueryRowContext(ctx, database.GetPharmacyDrugById, pharmacyDrugId).Scan(&pharmacyDrug.Id, &pharmacyDrug.PharmacyId, &pharmacyDrug.DrugId, &pharmacyDrug.Price, &pharmacyDrug.Stock)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}

		return nil, err
	}
	return &pharmacyDrug, nil
}
