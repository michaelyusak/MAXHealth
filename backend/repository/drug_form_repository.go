package repository

import (
	"context"
	"database/sql"

	"max-health/database"
	"max-health/entity"
)

type DrugFormRepository interface {
	FindOneById(ctx context.Context, id int64) (*entity.DrugForm, error)
	GetAllDrugForm(ctx context.Context) ([]entity.DrugForm, error)
}

type drugFormRepositoryPostgres struct {
	db DBTX
}

func NewDrugFormRepositoryPostgres(db *sql.DB) drugFormRepositoryPostgres {
	return drugFormRepositoryPostgres{
		db: db,
	}
}

func (r *drugFormRepositoryPostgres) FindOneById(ctx context.Context, id int64) (*entity.DrugForm, error) {
	var drugForm entity.DrugForm

	if err := r.db.QueryRowContext(ctx, database.GetOneDrugFormById, id).Scan(&drugForm.Id, &drugForm.Name); err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}

		return nil, err
	}

	return &drugForm, nil
}

func (r *drugFormRepositoryPostgres) GetAllDrugForm(ctx context.Context) ([]entity.DrugForm, error) {
	rows, err := r.db.QueryContext(ctx, database.GetAllDrugFormQuery)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var drugFormList []entity.DrugForm

	for rows.Next() {
		var drugForm entity.DrugForm

		err = rows.Scan(&drugForm.Id, &drugForm.Name)
		if err != nil {
			return nil, err
		}

		drugFormList = append(drugFormList, drugForm)
	}

	if err = rows.Err(); err != nil {
		return nil, err
	}

	return drugFormList, nil
}
