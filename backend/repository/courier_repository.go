package repository

import (
	"context"
	"database/sql"

	"max-health/database"
	"max-health/entity"
)

type CourierRepository interface {
	FindAll(ctx context.Context) ([]entity.Courier, error)
}

type courierRepositoryPostgres struct {
	db DBTX
}

func NewCourierRepositoryPostgres(db *sql.DB) courierRepositoryPostgres {
	return courierRepositoryPostgres{
		db: db,
	}
}

func (r *courierRepositoryPostgres) FindAll(ctx context.Context) ([]entity.Courier, error) {
	couriers := []entity.Courier{}

	rows, err := r.db.QueryContext(ctx, database.GetCouriers)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, err
		}

		return nil, err
	}
	defer rows.Close()

	for rows.Next() {
		courier := entity.Courier{}

		if err := rows.Scan(&courier.Id, &courier.Name); err != nil {
			return nil, err
		}

		couriers = append(couriers, courier)
	}
	return couriers, nil
}
