package repository

import (
	"context"
	"database/sql"

	"max-health/database"
	"max-health/entity"
)

type UserRepository interface {
	PostOneUser(ctx context.Context, accountId int) error
	FindUserByAccountId(ctx context.Context, accountId int64) (*entity.User, error)
	UpdateDataOne(ctx context.Context, user *entity.DetailedUser) error
}

type userRepositoryPostgres struct {
	db DBTX
}

func NewUserRepositoryPostgres(db *sql.DB) userRepositoryPostgres {
	return userRepositoryPostgres{
		db: db,
	}
}

func (r *userRepositoryPostgres) PostOneUser(ctx context.Context, accountId int) error {
	_, err := r.db.ExecContext(ctx, database.PostOneUserQuery, accountId)
	if err != nil {
		return err
	}

	return nil
}

func (r *userRepositoryPostgres) FindUserByAccountId(ctx context.Context, accountId int64) (*entity.User, error) {
	var user entity.User

	if err := r.db.QueryRowContext(ctx, database.FindUserByAccountIdQuery, accountId).Scan(&user.Id, &user.GenderId, &user.GenderName, &user.DateOfBirth); err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}
		return nil, err
	}

	user.AccountId = accountId

	return &user, nil
}

func (r *userRepositoryPostgres) UpdateDataOne(ctx context.Context, user *entity.DetailedUser) error {
	_, err := r.db.ExecContext(ctx, database.UpdateDataOneUser, user.GenderId, user.DateOfBirth, user.Id)
	if err != nil {
		return err
	}

	return nil
}
