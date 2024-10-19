package repository

import (
	"context"
	"database/sql"
	"max-health/database"
	"max-health/entity"
	"time"
)

type WsChatRoomRepository interface {
	FindActiveWsChatRoom(ctx context.Context, userAccountId, doctorAccountId int64) (*entity.WsChatRoom, error)
	FindWsChatRoomByHash(ctx context.Context, roomHash string) (*entity.WsChatRoom, error)
	CreateWsChatRoom(ctx context.Context, newWsChatRoom entity.WsChatRoom) (*int64, error)
	GetAllRooms(ctx context.Context, accountId int64) ([]entity.WsChatRoomPreview, error)
	FindChatRoomById(ctx context.Context, chatRoomId int64) (*entity.WsChatRoom, error)
	CloseWsChatRoom(ctx context.Context, roomId int64) error
	StartWsChat(ctx context.Context, roomId int64, expiredAt time.Time) error
}

type wsChatRoomRepositoryPostgres struct {
	db *sql.DB
}

func NewWsChatRoomRepositoryPostgres(db *sql.DB) *wsChatRoomRepositoryPostgres {
	return &wsChatRoomRepositoryPostgres{
		db: db,
	}
}

func (r *wsChatRoomRepositoryPostgres) FindActiveWsChatRoom(ctx context.Context, userAccountId, doctorAccountId int64) (*entity.WsChatRoom, error) {
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
		if err == sql.ErrNoRows {
			return nil, nil
		}

		return nil, err
	}

	wsChatRoom.Hash = roomHash

	return &wsChatRoom, nil
}

func (r *wsChatRoomRepositoryPostgres) GetAllRooms(ctx context.Context, accountId int64) ([]entity.WsChatRoomPreview, error) {
	rows, err := r.db.QueryContext(ctx, database.GetAllWsRoomQuery, accountId)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}

		return nil, err
	}
	defer rows.Close()

	var roomList []entity.WsChatRoomPreview

	for rows.Next() {
		var room entity.WsChatRoomPreview

		err := rows.Scan(
			&room.Id,
			&room.Hash,
			&room.ParticipantName,
			&room.ParticipantPictureUrl,
			&room.LastChat.Message,
			&room.LastChat.Attachment.Format,
			&room.LastChat.Attachment.Url,
			&room.ExpiredAt,
			&room.LastChat.CreatedAt,
		)
		if err != nil {
			return nil, err
		}

		roomList = append(roomList, room)
	}

	err = rows.Err()
	if err != nil {
		return nil, err
	}

	return roomList, nil
}

func (r *wsChatRoomRepositoryPostgres) FindChatRoomById(ctx context.Context, chatRoomId int64) (*entity.WsChatRoom, error) {
	var chatRoom entity.WsChatRoom

	err := r.db.QueryRowContext(ctx, database.FindWsChatRoomByIdQuery, chatRoomId).Scan(&chatRoom.Hash, &chatRoom.UserAccountId, &chatRoom.DoctorAccountId, &chatRoom.ExpiredAt)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}

		return nil, err
	}

	chatRoom.Id = chatRoomId

	return &chatRoom, nil
}

func (r *wsChatRoomRepositoryPostgres) CloseWsChatRoom(ctx context.Context, roomId int64) error {
	_, err := r.db.ExecContext(ctx, database.CloseWsChatRoomQuery, roomId)
	if err != nil {
		return err
	}

	return nil
}

func (r *wsChatRoomRepositoryPostgres) StartWsChat(ctx context.Context, roomId int64, expiredAt time.Time) error {
	_, err := r.db.ExecContext(ctx, database.StartWsChatQuery, roomId, expiredAt)
	if err != nil {
		return err
	}

	return nil
}
