package repository

import (
	"context"
	"database/sql"
	"max-health/database"
	"max-health/entity"
)

type WsChatRoomRepository interface {
	FindWsChatRoom(ctx context.Context, userAccountId, doctorAccountId int64) (*entity.WsChatRoom, error)
	FindWsChatRoomByHash(ctx context.Context, roomHash string) (*entity.WsChatRoom, error)
	CreateWsChatRoom(ctx context.Context, newWsChatRoom entity.WsChatRoom) (*int64, error)
}

type wsChatRoomRepositoryPostgres struct {
	db *sql.DB
}

func NewWsChatRoomRepositoryPostgres(db *sql.DB) *wsChatRoomRepositoryPostgres {
	return &wsChatRoomRepositoryPostgres{
		db: db,
	}
}

func (r *wsChatRoomRepositoryPostgres) FindWsChatRoom(ctx context.Context, userAccountId, doctorAccountId int64) (*entity.WsChatRoom, error) {
	var wsChatRoom entity.WsChatRoom

	err := r.db.QueryRowContext(ctx, database.FindWsChatRoomQuery, userAccountId, doctorAccountId).Scan(&wsChatRoom.Id, &wsChatRoom.Hash, &wsChatRoom.UserAccountId, &wsChatRoom.DoctorAccountId, &wsChatRoom.ExpiredAt)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}

		return nil, err
	}

	return &wsChatRoom, nil
}

func (r *wsChatRoomRepositoryPostgres) CreateWsChatRoom(ctx context.Context, newWsChatRoom entity.WsChatRoom) (*int64, error) {
	var roomId int64
	
	err := r.db.QueryRowContext(ctx, database.CreateWsChatRoomQuery, newWsChatRoom.Hash, newWsChatRoom.UserAccountId, newWsChatRoom.DoctorAccountId, newWsChatRoom.ExpiredAt).Scan(&roomId)
	if err != nil {
		return nil, err
	}

	return &roomId, nil
}

func (r *wsChatRoomRepositoryPostgres) FindWsChatRoomByHash(ctx context.Context, roomHash string) (*entity.WsChatRoom, error) {
	var wsChatRoom entity.WsChatRoom

	err := r.db.QueryRowContext(ctx, database.FindWsChatRoomByHashQuery, roomHash).Scan(&wsChatRoom.Id, &wsChatRoom.UserAccountId, &wsChatRoom.DoctorAccountId, &wsChatRoom.ExpiredAt)
	if err != nil {
		if err ==  sql.ErrNoRows {
			return nil, nil
		}

		return nil, err
	}

	wsChatRoom.Hash = roomHash

	return &wsChatRoom, nil
}