package usecase

import (
	"context"
	"encoding/json"
	"max-health/appconstant"
	"max-health/apperror"
	"max-health/dto"
	"max-health/entity"
	"max-health/repository"
	"max-health/util"
	"time"

	"github.com/go-playground/validator/v10"
)

type WsUsecase interface {
	GenerateToken(ctx context.Context, roomHash string) (entity.WsToken, error)
	HandleCentrifugo(ctx context.Context, wsToken entity.WsToken, toClient, fromClient chan []byte, chClose chan bool) error
}

type wsUsecaseImpl struct {
	wsChatRoomRepository       repository.WsChatRoomRepository
	prescriptionRepository     repository.PrescriptionRepository
	prescriptionDrugRepository repository.PrescriptionDrugRepository
	chatRepository             repository.ChatRepository
	jwtHelper                  util.JwtAuthentication
	transaction                repository.Transaction
}

func NewWsUsecaseImpl(wsChatRoomRepository repository.WsChatRoomRepository, prescriptionRepository repository.PrescriptionRepository, prescriptionDrugRepository repository.PrescriptionDrugRepository, chatRepository repository.ChatRepository, jwtHelper util.JwtAuthentication, transaction repository.Transaction) *wsUsecaseImpl {
	return &wsUsecaseImpl{
		wsChatRoomRepository:       wsChatRoomRepository,
		prescriptionRepository:     prescriptionRepository,
		prescriptionDrugRepository: prescriptionDrugRepository,
		chatRepository:             chatRepository,
		jwtHelper:                  jwtHelper,
		transaction:                transaction,
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
	if room.ExpiredAt != nil {
		if room.ExpiredAt.Before(time.Now()) {
			return apperror.ChatRoomAlreadyClosedError()
		}
	}

	fromCentrifugo := make(chan []byte, 5)
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

outer:
	for {
		select {
		case data := <-fromClient:
			res, err := u.handleChatMessage(ctx, data)
			if err != nil {
				break outer
			}

			err = centrifugoHelper.Publish(ctx, res)
			if err != nil {
				continue
			}

		case data := <-fromCentrifugo:
			toClient <- data
		}
	}

	return nil
}

func (u *wsUsecaseImpl) handleChatMessage(ctx context.Context, chatData []byte) ([]byte, error) {
	var wsDataReq dto.WsChatData
	err := json.Unmarshal(chatData, &wsDataReq)
	if err != nil {
		return nil, apperror.InternalServerError(err)
	}

	err = validator.New().Struct(wsDataReq)
	if err != nil {
		return nil, apperror.InternalServerError(err)
	}

	channel, side, chat := dto.ToChatEntity(wsDataReq)

	room, err := u.wsChatRoomRepository.FindWsChatRoomByHash(ctx, channel)
	if err != nil {
		return nil, apperror.InternalServerError(err)
	}
	if room == nil {
		return nil, apperror.InternalServerError(err)
	}

	chat.SenderAccountId = room.UserAccountId
	if side == 2 {
		chat.SenderAccountId = room.DoctorAccountId
	}

	chat.RoomId = room.Id

	tx, err := u.transaction.BeginTx()
	if err != nil {
		return nil, apperror.InternalServerError(err)
	}
	defer func() {
		if err != nil {
			tx.Rollback()
			return
		}

		tx.Commit()
	}()

	prescriptionRepo := tx.PrescriptionRepository()
	prescriptionDrugRepo := tx.PrescriptionDrugRepository()
	chatRepo := tx.ChatRepository()

	if len(chat.Prescription.PrescriptionDrugs) > 0 {
		prescriptionId, err := prescriptionRepo.CreateOnePrescription(ctx, room.UserAccountId, room.DoctorAccountId)
		if err != nil {
			return nil, apperror.InternalServerError(err)
		}

		for _, prescriptionDrug := range chat.Prescription.PrescriptionDrugs {
			err := prescriptionDrugRepo.PostOnePrescriptionDrug(ctx, *prescriptionId, prescriptionDrug)
			if err != nil {
				return nil, apperror.InternalServerError(err)
			}
		}

		chat.Prescription.Id = prescriptionId
	}

	chatId, createdAt, err := chatRepo.PostOneChat(ctx, chat)
	if err != nil {
		return nil, apperror.InternalServerError(err)
	}

	chat.Id = *chatId
	chat.CreatedAt = &createdAt

	res, err := json.Marshal(chat)
	if err != nil {
		return nil, apperror.InternalServerError(err)
	}

	return res, nil
}
