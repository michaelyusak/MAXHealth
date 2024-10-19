package usecase

import (
	"context"
	"encoding/json"
	"max-health/appconstant"
	"max-health/apperror"
	"max-health/entity"
	"max-health/repository"
	"max-health/util"
	"time"
)

type WsUsecase interface {
	GenerateToken(ctx context.Context, roomHash string) (entity.WsToken, error)
	HandleCentrifugo(ctx context.Context, wsToken entity.WsToken, toClient, fromClient chan []byte, chClose chan bool) error
}

type wsUsecaseImpl struct {
	wsChatRoomRepository repository.WsChatRoomRepository
	chatRepository       repository.ChatRepository
	jwtHelper            util.JwtAuthentication
}

func NewWsUsecaseImpl(wsChatRoomRepository repository.WsChatRoomRepository, chatRepository repository.ChatRepository, jwtHelper util.JwtAuthentication) *wsUsecaseImpl {
	return &wsUsecaseImpl{
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

func (u *wsUsecaseImpl) HandleCentrifugo(ctx context.Context, wsToken entity.WsToken, toClient, fromClient chan []byte, chClose chan bool) error {
	room, err := u.wsChatRoomRepository.FindWsChatRoomByHash(ctx, wsToken.Channel)
	if err != nil {
		return apperror.InternalServerError(err)
	}
	if room == nil {
		return apperror.ChatRoomNotFoundError()
	}
	if room.ExpiredAt.Before(time.Now()) {
		return apperror.ChatRoomAlreadyClosedError()
	}
	
	fromCentrifugo := make(chan []byte)

	defer close(fromCentrifugo)

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
