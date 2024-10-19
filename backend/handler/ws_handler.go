package handler

import (
	"context"
	"encoding/base64"
	"fmt"
	"max-health/appconstant"
	"max-health/apperror"
	"max-health/dto"
	"max-health/usecase"
	"max-health/util"
	"strings"

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
	var channel string
	var channelToken string
	var clientToken string

	data := ctx.GetHeader("Sec-WebSocket-Protocol")

	dataSplitted := strings.Split(data, ",")

	for _, val := range dataSplitted {
		if strings.Contains(val, appconstant.ClientTokenHeaderKey) {
			valDecoded, err := base64.StdEncoding.DecodeString(strings.Split(val, ":")[1])
			if err != nil {
				ctx.Error(apperror.InternalServerError(err))
				return
			}

			clientToken = string(valDecoded)
			continue
		}

		if strings.Contains(val, appconstant.ChannelTokenHeaderKey) {
			valDecoded, err := base64.StdEncoding.DecodeString(strings.Split(val, ":")[1])
			if err != nil {
				ctx.Error(apperror.InternalServerError(err))
				return
			}

			channelToken = string(valDecoded)
			continue
		}

		if strings.Contains(val, appconstant.ChannelHeaderKey) {
			valDecoded, err := base64.StdEncoding.DecodeString(strings.Split(val, ":")[1])
			if err != nil {
				ctx.Error(apperror.InternalServerError(err))
				return
			}

			channel = string(valDecoded)
			continue
		}
	}

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

	requestId, exist := ctx.Get(appconstant.RequestId)
	if !exist {
		requestId = ""
	}
	path := ctx.Request.URL.Path

	go func() {
		h.logger.WithFields(logrus.Fields{
			"path":       path,
			"request-id": requestId,
		}).Infof("open connection to centrifugo")

		err = h.wsUsecase.HandleCentrifugo(ctx.Request.Context(), wsToken, toClient, fromClient, chClose)
		if err != nil {
			conn.Close()
			ctx.Error(err)
			return
		}
	}()

	go func() {
		for {
			chat := <-toClient

			err := conn.WriteMessage(websocket.TextMessage, chat)
			if err != nil {
				h.logger.WithFields(logrus.Fields{
					"error":      fmt.Sprintf("error writing message: %s", err.Error()),
					"path":       path,
					"request-id": requestId,
				}).Warn()
				return
			}
		}
	}()

	go func() {
		for {
			messageType, chat, err := conn.ReadMessage()
			if err != nil {
				h.logger.WithFields(logrus.Fields{
					"error":      fmt.Sprintf("error reading message: %s", err.Error()),
					"path":       path,
					"request-id": requestId,
				}).Warn()
				return
			}

			if messageType == websocket.TextMessage {
				fromClient <- chat
			}
		}
	}()

	select {}
}

func (h *WsHandler) ConnectToRoomV2(ctx *gin.Context) {
	// TO DO
	// LISTEN FOR AUTH MESSAGE
	// IF GOT AUTH MESSAGE SEND TO CHANNEL {{AUTH_MSG}}
	// ONE GO ROUTINE TO HANDLE CENTRIFUGO (START WHEN GET AUTH MSG)
	// IF GOT MESSAGE BEFORE AUTH_MSG, CLOSE CONN
	// CAN CREATE LOCAL VAR TO STORE TOKEN
}