package usecase

import (
	"context"
	"encoding/json"
	"fmt"
	"max-health/appconstant"
	"max-health/apperror"
	"max-health/entity"
	"max-health/repository"
	"max-health/util"
	"time"
)

type WsUsecase interface {
	GenerateToken(ctx context.Context, roomHash string) (entity.WsToken, error)
	CreateRoom(ctx context.Context, userAccountId, doctorAccountId int64) (*entity.WsChatRoom, error)
	HandleCentrifugo(ctx context.Context, wsToken entity.WsToken, toClient, fromClient chan []byte, chClose chan bool) error
}

type wsUsecaseImpl struct {
	userRepository       repository.UserRepository
	doctorRepository     repository.DoctorRepository
	wsChatRoomRepository repository.WsChatRoomRepository
	chatRepository       repository.ChatRepository
	jwtHelper            util.JwtAuthentication
}

func NewWsUsecaseImpl(userRepository repository.UserRepository, doctorRepository repository.DoctorRepository, wsChatRoomRepository repository.WsChatRoomRepository, chatRepository repository.ChatRepository, jwtHelper util.JwtAuthentication) *wsUsecaseImpl {
	return &wsUsecaseImpl{
		userRepository:       userRepository,
		doctorRepository:     doctorRepository,
		wsChatRoomRepository: wsChatRoomRepository,
		chatRepository:       chatRepository,
		jwtHelper:            jwtHelper,
	}
}

func (u *wsUsecaseImpl) GenerateToken(ctx context.Context, roomHash string) (entity.WsToken, error) {
	var wsToken entity.WsToken

	room, err := u.wsChatRoomRepository.FindWsChatRoomByHash(ctx, roomHash)
	if err != nil {
		return wsToken, apperror.InternalServerError(err)
	}
	if room == nil {
		return wsToken, apperror.ChatRoomNotFoundError()
	}

	accountId := ctx.Value(appconstant.AccountIdKey).(int64)
	if accountId != room.UserAccountId && accountId != room.DoctorAccountId {
		return wsToken, apperror.UnauthorizedError()
	}

	tokenExpiredAt := time.Now().Add(time.Duration(appconstant.ChatRoomTokenDuration * time.Minute)).UnixMilli()

	clientToken, err := u.jwtHelper.CentrifugoClientCreateAndSign(util.CentrifugoClientClaims{
		AccountId: accountId,
		ExpiredAt: tokenExpiredAt,
	})
	if err != nil {
		return wsToken, apperror.InternalServerError(err)
	}

	channelToken, err := u.jwtHelper.CentrifugoChannelCreateAndSign(util.CentrifugoChannelClaims{
		AccountId: accountId,
		Channel:   room.Hash,
		ExpiredAt: tokenExpiredAt,
	})
	if err != nil {
		return wsToken, apperror.InternalServerError(err)
	}

	wsToken.Channel = room.Hash
	wsToken.Token.ClientToken = *clientToken
	wsToken.Token.ChannelToken = *channelToken

	return wsToken, nil
}

func (u *wsUsecaseImpl) CreateRoom(ctx context.Context, userAccountId, doctorAccountId int64) (*entity.WsChatRoom, error) {
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

	chatRoom, err := u.wsChatRoomRepository.FindWsChatRoom(ctx, user.AccountId, doctor.AccountId)
	if err != nil {
		return nil, apperror.InternalServerError(err)
	}
	if chatRoom != nil {
		if chatRoom.ExpiredAt.After(time.Now()) {
			return chatRoom, nil
		}
	}

	hash, err := util.GenerateRandomString()
	if err != nil {
		return nil, apperror.InternalServerError(err)
	}

	chatRoomExpiredAt := time.Now().Add(appconstant.ChatRoomDuration).Local()

	newWsChatRoom := entity.WsChatRoom{
		Hash:            fmt.Sprintf("$private:%s#%v,%v", hash, user.AccountId, doctor.AccountId),
		UserAccountId:   user.AccountId,
		DoctorAccountId: doctor.AccountId,
		ExpiredAt:       &chatRoomExpiredAt,
		Chats:           []entity.Chat{},
	}

	roomId, err := u.wsChatRoomRepository.CreateWsChatRoom(ctx, newWsChatRoom)
	if err != nil {
		return nil, apperror.InternalServerError(err)
	}

	newWsChatRoom.Id = *roomId

	return &newWsChatRoom, nil
}

func (u *wsUsecaseImpl) HandleCentrifugo(ctx context.Context, wsToken entity.WsToken, toClient, fromClient chan []byte, chClose chan bool) error {
	fromCentrifugo := make(chan []byte)

	centrifugoHelper, err := util.NewCentrifugoHelperImpl(wsToken.Token.ClientToken, wsToken.Token.ChannelToken, wsToken.Channel)
	if err != nil {
		return apperror.InternalServerError(err)
	}
	defer centrifugoHelper.Stop()

	err = centrifugoHelper.Connect(chClose)
	if err != nil {
		return apperror.InternalServerError(err)
	}

	err = centrifugoHelper.Start(ctx, chClose, fromCentrifugo)
	if err != nil {
		return apperror.InternalServerError(err)
	}

	for {
		select {
		case data := <-fromClient:
			var chat entity.Chat
			err := json.Unmarshal(data, &chat)
			if err != nil {
				continue
			}

			chatId, createdAt, err := u.chatRepository.PostOneChat(ctx, chat)
			if err != nil {
				continue
			}

			chat.Id = *chatId
			chat.CreatedAt = &createdAt

			res, err := json.Marshal(chat)
			if err != nil {
				continue
			}

			err = centrifugoHelper.Publish(ctx, res)
			if err != nil {
				continue
			}

		case data := <-fromCentrifugo:
			toClient <- data
		}
	}
}
