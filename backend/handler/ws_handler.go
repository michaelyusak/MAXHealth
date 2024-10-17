package handler

import (
	"context"
	"max-health/appconstant"
	"max-health/apperror"
	"max-health/dto"
	"max-health/usecase"
	"max-health/util"

	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
	"github.com/gorilla/websocket"
	"github.com/sirupsen/logrus"
)

type WsHandler struct {
	wsUsecase usecase.WsUsecase
	upgrader  websocket.Upgrader
	logger    *logrus.Logger
}

func NewWsHandler(wsUsecase usecase.WsUsecase, upgrader websocket.Upgrader, logger *logrus.Logger) *WsHandler {
	return &WsHandler{
		wsUsecase: wsUsecase,
		upgrader:  upgrader,
		logger:    logger,
	}
}

func (h *WsHandler) GenerateToken(ctx *gin.Context) {
	ctx.Header("Content-Type", "application/json")

	AccountId, exists := ctx.Get(appconstant.AccountId)
	if !exists {
		ctx.Error(apperror.UnauthorizedError())
		return
	}

	var req dto.GenerateTokenReq
	err := ctx.ShouldBindJSON(&req)
	if err != nil {
		ctx.Error(err)
		return
	}

	c := context.WithValue(ctx, appconstant.AccountIdKey, AccountId)

	wsToken, err := h.wsUsecase.GenerateToken(c, req.RoomHash)
	if err != nil {
		ctx.Error(err)
		return
	}

	util.ResponseOK(ctx, dto.ToWsTokenDTO(wsToken))
}

func (h *WsHandler) ConnectToRoom(ctx *gin.Context) {
	_, exists := ctx.Get(appconstant.AccountId)
	if !exists {
		ctx.Error(apperror.UnauthorizedError())
		return
	}

	channel := ctx.GetHeader(appconstant.ChannelHeaderKey)
	channelToken := ctx.GetHeader(appconstant.ChannelTokenHeaderKey)
	clientToken := ctx.GetHeader(appconstant.ClientTokenHeaderKey)

	req := dto.ConnectToRoomReq{
		ClientToken:  clientToken,
		ChannelToken: channelToken,
		Channel:      channel,
	}

	err := validator.New().Struct(req)
	if err != nil {
		ctx.Error(err)
		return
	}

	fromClient := make(chan []byte)
	toClient := make(chan []byte)
	chClose := make(chan bool)

	defer close(fromClient)
	defer close(toClient)
	defer close(chClose)

	conn, err := h.upgrader.Upgrade(ctx.Writer, ctx.Request, nil)
	if err != nil {
		ctx.Error(err)
		return
	}
	defer conn.Close()

	wsToken := dto.ToWsTokenEntity(req)

	go func() {
		err = h.wsUsecase.HandleCentrifugo(ctx.Request.Context(), wsToken, toClient, fromClient, chClose)
		if err != nil {
			ctx.Error(err)
			chClose <- true
			return
		}
	}()

	go func() {
		for {
			chat := <-toClient

			err := conn.WriteMessage(websocket.TextMessage, chat)
			if err != nil {
				h.logger.Errorf("error writing message: %s", err.Error())
				return
			}
		}
	}()

	go func() {
		for {
			messageType, chat, err := conn.ReadMessage()
			if err != nil {
				h.logger.Errorf("error reading message: %s", err.Error())
				chClose <- true
				return
			}

			if messageType == websocket.TextMessage {
				fromClient <- chat
			}
		}
	}()

	<-chClose
}
