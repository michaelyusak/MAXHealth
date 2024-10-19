package usecase

import (
	"context"
	"fmt"
	"max-health/appconstant"
	"max-health/apperror"
	"max-health/entity"
	"max-health/repository"
	"max-health/util"
	"time"
)

// to do: move CreateWsRoom here

type ChatRoomUsecasae interface {
	GetAllRooms(ctx context.Context, accountId int64) ([]entity.WsChatRoomPreview, error)
	UserCreateRoom(ctx context.Context, userAccountId, doctorAccountId int64) (*entity.WsChatRoom, error)
	CloseChatRoom(ctx context.Context, userAccountId, roomId int64) error
	DoctorJoinRoom(ctx context.Context, doctorAccountId, roomId int64) error
	GetRoomDetail(ctx context.Context, accountId, roomId int64) (*entity.WsChatRoom, error)
}

type chatRoomUsecaseImpl struct {
	userRepository       repository.UserRepository
	doctorRepository     repository.DoctorRepository
	wsChatRoomRepository repository.WsChatRoomRepository
	accountRepository    repository.AccountRepository
}

func NewChatRoomUsecaseImpl(userRepository repository.UserRepository, doctorRepository repository.DoctorRepository, wsChatRoomRepository repository.WsChatRoomRepository, accountRepository repository.AccountRepository) *chatRoomUsecaseImpl {
	return &chatRoomUsecaseImpl{
		userRepository:       userRepository,
		doctorRepository:     doctorRepository,
		wsChatRoomRepository: wsChatRoomRepository,
		accountRepository:    accountRepository,
	}
}

func (u *chatRoomUsecaseImpl) GetAllRooms(ctx context.Context, accountId int64) ([]entity.WsChatRoomPreview, error) {
	account, err := u.accountRepository.FindOneById(ctx, accountId)
	if err != nil {
		return nil, apperror.InternalServerError(err)
	}
	if account == nil {
		return nil, apperror.AccountNotFoundError()
	}

	roomList, err := u.wsChatRoomRepository.GetAllRooms(ctx, account.Id)
	if err != nil {
		return nil, apperror.InternalServerError(err)
	}

	return roomList, nil
}

func (u *chatRoomUsecaseImpl) UserCreateRoom(ctx context.Context, userAccountId, doctorAccountId int64) (*entity.WsChatRoom, error) {
	user, err := u.userRepository.FindUserByAccountId(ctx, userAccountId)
	if err != nil {
		return nil, apperror.InternalServerError(err)
	}
	if user == nil {
		return nil, apperror.UserNotFoundError()
	}

	doctor, err := u.doctorRepository.FindDoctorByAccountId(ctx, doctorAccountId)
	if err != nil {
		return nil, apperror.InternalServerError(err)
	}
	if doctor == nil {
		return nil, apperror.DoctorNotFoundError()
	}

	chatRoom, err := u.wsChatRoomRepository.FindActiveWsChatRoom(ctx, user.AccountId, doctor.AccountId)
	if err != nil {
		return nil, apperror.InternalServerError(err)
	}
	if chatRoom != nil {
		if chatRoom.ExpiredAt == nil {
			return chatRoom, nil
		}

		if chatRoom.ExpiredAt.After(time.Now()) {
			return chatRoom, nil
		}
	}

	hash, err := util.GenerateRandomString()
	if err != nil {
		return nil, apperror.InternalServerError(err)
	}

	newWsChatRoom := entity.WsChatRoom{
		Hash:            fmt.Sprintf("$private:%s#%v,%v", hash, user.AccountId, doctor.AccountId),
		UserAccountId:   user.AccountId,
		DoctorAccountId: doctor.AccountId,
		Chats:           []entity.Chat{},
	}

	roomId, err := u.wsChatRoomRepository.CreateWsChatRoom(ctx, newWsChatRoom)
	if err != nil {
		return nil, apperror.InternalServerError(err)
	}

	newWsChatRoom.Id = *roomId

	return &newWsChatRoom, nil
}

func (u *chatRoomUsecaseImpl) CloseChatRoom(ctx context.Context, userAccountId, roomId int64) error {
	chatRoom, err := u.wsChatRoomRepository.FindChatRoomById(ctx, roomId)
	if err != nil {
		return apperror.InternalServerError(err)
	}

	if chatRoom == nil {
		return apperror.ChatRoomNotFoundError()
	}

	if chatRoom.UserAccountId != userAccountId {
		return apperror.ForbiddenAction()
	}

	if chatRoom.ExpiredAt != nil && chatRoom.ExpiredAt.Before(time.Now()) {
		return apperror.ChatRoomAlreadyClosedError()
	}

	err = u.wsChatRoomRepository.CloseWsChatRoom(ctx, chatRoom.Id)
	if err != nil {
		return apperror.InternalServerError(err)
	}

	return nil
}

func (u *chatRoomUsecaseImpl) DoctorJoinRoom(ctx context.Context, doctorAccountId, roomId int64) error {
	room, err := u.wsChatRoomRepository.FindChatRoomById(ctx, roomId)
	if err != nil {
		return apperror.InternalServerError(err)
	}
	if room == nil {
		return apperror.BadRequestError(err)
	}
	if room.DoctorAccountId != doctorAccountId {
		return apperror.ForbiddenAction()
	}

	expiredAt := time.Now().Add(appconstant.ChatRoomDuration).UTC()

	err = u.wsChatRoomRepository.StartWsChat(ctx, roomId, expiredAt)
	if err != nil {
		return apperror.InternalServerError(err)
	}

	return nil
}

func (u *chatRoomUsecaseImpl) GetRoomDetail(ctx context.Context, accountId, roomId int64) (*entity.WsChatRoom, error) {
	account, err := u.accountRepository.FindOneById(ctx, accountId)
	if err != nil {
		return nil, apperror.InternalServerError(err)
	}
	if account == nil {
		return nil, apperror.UnauthorizedError()
	}

	room, err := u.wsChatRoomRepository.FindChatRoomById(ctx, roomId)
	if err != nil {
		return nil, apperror.InternalServerError(err)
	}
	if room == nil {
		return nil, apperror.ChatRoomNotFoundError()
	}

	if account.Id != room.DoctorAccountId && account.Id != room.UserAccountId {
		return nil, apperror.UnauthorizedError()
	}

	return room, nil
}