package repository

import (
	"context"
	"database/sql"

	"max-health/database"
	"max-health/entity"
)

type AccountRepository interface {
	FindAccountByEmail(ctx context.Context, email string) (*entity.Account, error)
	FindOnePasswordById(ctx context.Context, id int64) (*string, error)
	FindOneById(ctx context.Context, id int64) (*entity.Account, error)
	PostOneAccount(ctx context.Context, account entity.Account) (*int, error)
	PostOneVerifiedAccount(ctx context.Context, account entity.Account) (*int64, error)
	UpdatePasswordOne(ctx context.Context, account *entity.Account) error
	UpdateDataOne(ctx context.Context, account *entity.Account) error
	UpdateNameAndProfilePictureOne(ctx context.Context, account *entity.Account) error
	DeleteOneById(ctx context.Context, accountId int64) error
}

type accountRepositoryPostgres struct {
	db DBTX
}

func NewAccountRepositoryPostgres(db *sql.DB) accountRepositoryPostgres {
	return accountRepositoryPostgres{
		db: db,
	}
}

func (r *accountRepositoryPostgres) FindAccountByEmail(ctx context.Context, email string) (*entity.Account, error) {
	var account entity.Account
	err := r.db.QueryRowContext(ctx, database.FindAccountByEmailQuery, email).Scan(&account.Id, &account.Email, &account.Password, &account.RoleId, &account.RoleName, &account.Name, &account.ProfilePicture, &account.VerifiedAt)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}

		return nil, err
	}

	return &account, nil
}

func (r *accountRepositoryPostgres) FindOnePasswordById(ctx context.Context, id int64) (*string, error) {
	var password string

	err := r.db.QueryRowContext(ctx, database.FindOneAccountPasswordByIdQuery, id).Scan(&password)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}

		return nil, err
	}

	return &password, nil
}

func (r *accountRepositoryPostgres) FindOneById(ctx context.Context, id int64) (*entity.Account, error) {
	var account entity.Account

	err := r.db.QueryRowContext(ctx, database.FindOneAccountByIdQuery, id).Scan(&account.Name, &account.Password, &account.Email, &account.ProfilePicture)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}

		return nil, err
	}

	account.Id = id

	return &account, nil
}

func (r *accountRepositoryPostgres) PostOneAccount(ctx context.Context, account entity.Account) (*int, error) {
	var accountId int

	err := r.db.QueryRowContext(ctx, database.PostOneAccountQuery, account.Email, account.Password, account.RoleId, account.Name).Scan(&accountId)
	if err != nil {
		return nil, err
	}

	return &accountId, nil
}

func (r *accountRepositoryPostgres) PostOneVerifiedAccount(ctx context.Context, account entity.Account) (*int64, error) {
	var accountId int64

	if err := r.db.QueryRowContext(ctx, database.PostOneVerifiedAccountQuery, account.Email, account.Password, account.RoleId, account.Name, account.ProfilePicture).Scan(&accountId); err != nil {
		return nil, err
	}

	return &accountId, nil
}

func (r *accountRepositoryPostgres) UpdatePasswordOne(ctx context.Context, account *entity.Account) error {
	query := database.QueryUpdatePasswordOneAccount

	_, err := r.db.ExecContext(ctx, query, account.Password, account.Id)
	if err != nil {
		return err
	}

	return nil
}

func (r *accountRepositoryPostgres) UpdateDataOne(ctx context.Context, account *entity.Account) error {
	_, err := r.db.ExecContext(ctx, database.UpdateDataOneAccount, account.Name, account.Password, account.ProfilePicture, account.Id)
	if err != nil {
		return err
	}

	return nil
}

func (r *accountRepositoryPostgres) UpdateNameAndProfilePictureOne(ctx context.Context, account *entity.Account) error {
	_, err := r.db.ExecContext(ctx, database.UpdateNameAndProfilePictureOneAccount, account.Name, account.ProfilePicture, account.Id)
	if err != nil {
		return err
	}

	return nil
}

func (r *accountRepositoryPostgres) DeleteOneById(ctx context.Context, accountId int64) error {
	_, err := r.db.ExecContext(ctx, database.DeleteOneAccountByIdQuery, accountId)
	if err != nil {
		return err
	}
	return nil
}
