package repository

import (
	"context"
	"database/sql"

	"max-health/database"
	"max-health/entity"
)

type PharmacyManagerRepository interface {
	PostOne(ctx context.Context, accountId int64) error
	FindAll(ctx context.Context) ([]entity.PharmacyManager, error)
	FindOneById(ctx context.Context, pharmacyManagerId int64) (*entity.PharmacyManager, error)
	DeleteOneById(ctx context.Context, pharmacyManagerId int64) error
	FindOneByAccountId(ctx context.Context, accountId int64) (*entity.PharmacyManager, error)
	FindOneByPharmacyCourierId(ctx context.Context, pharmacyCourierId int64) (*entity.PharmacyManager, error)
}

type pharmacyManagerRepositoryPostgres struct {
	db DBTX
}

func NewpharmacyManagerRepositoryPostgres(db *sql.DB) pharmacyManagerRepositoryPostgres {
	return pharmacyManagerRepositoryPostgres{
		db: db,
	}
}

func (r *pharmacyManagerRepositoryPostgres) PostOne(ctx context.Context, accountId int64) error {
	_, err := r.db.ExecContext(ctx, database.PostOnePharmacyManagerQuery, accountId)
	if err != nil {
		return err
	}

	return nil
}

func (r *pharmacyManagerRepositoryPostgres) FindAll(ctx context.Context) ([]entity.PharmacyManager, error) {
	query := database.FindAllPharmacyManagers

	rows, err := r.db.QueryContext(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	pharmacyManagers := []entity.PharmacyManager{}
	for rows.Next() {
		var pharmacyManager entity.PharmacyManager
		err := rows.Scan(
			&pharmacyManager.Id,
			&pharmacyManager.Account.Id,
			&pharmacyManager.Account.Email,
			&pharmacyManager.Account.Name,
			&pharmacyManager.Account.ProfilePicture,
		)
		if err != nil {
			return nil, err
		}
		pharmacyManagers = append(pharmacyManagers, pharmacyManager)
	}

	if err = rows.Err(); err != nil {
		return nil, err
	}

	return pharmacyManagers, nil
}

func (r *pharmacyManagerRepositoryPostgres) FindOneById(ctx context.Context, pharmacyManagerId int64) (*entity.PharmacyManager, error) {
	var pharmacyManager entity.PharmacyManager

	if err := r.db.QueryRowContext(ctx, database.GetOnePharmacyManagerByIdQuery, pharmacyManagerId).Scan(&pharmacyManager.Id, &pharmacyManager.Account.Id, &pharmacyManager.Account.ProfilePicture); err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}

		return nil, err
	}

	return &pharmacyManager, nil
}

func (r *pharmacyManagerRepositoryPostgres) DeleteOneById(ctx context.Context, pharmacyManagerId int64) error {
	_, err := r.db.ExecContext(ctx, database.DeleteOnePharmacyManagerByIdQuery, pharmacyManagerId)
	if err != nil {
		return err
	}
	return nil
}

func (r *pharmacyManagerRepositoryPostgres) FindOneByAccountId(ctx context.Context, accountId int64) (*entity.PharmacyManager, error) {
	var pharmacyManager entity.PharmacyManager

	if err := r.db.QueryRowContext(ctx, database.GetOnePharmacyManagerByAccountIdQuery, accountId).Scan(&pharmacyManager.Id, &pharmacyManager.Account.Id, &pharmacyManager.Account.ProfilePicture); err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}

		return nil, err
	}

	return &pharmacyManager, nil
}

func (r *pharmacyManagerRepositoryPostgres) FindOneByPharmacyCourierId(ctx context.Context, pharmacyCourierId int64) (*entity.PharmacyManager, error) {
	var pharmacyManager entity.PharmacyManager

	if err := r.db.QueryRowContext(ctx, database.GetOnePharmacyManagerByPharmacyCourierIdQuery, pharmacyCourierId).Scan(&pharmacyManager.Id, &pharmacyManager.Account.Id, &pharmacyManager.Account.ProfilePicture); err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}

		return nil, err
	}

	return &pharmacyManager, nil
}
