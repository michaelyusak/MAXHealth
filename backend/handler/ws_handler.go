package handler

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"max-health/appconstant"
	"max-health/apperror"
	"max-health/dto"
	"max-health/entity"
	"max-health/usecase"
	"max-health/util"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
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
	var isAuthenticated bool
	var mutex sync.Mutex

	conn, err := h.upgrader.Upgrade(ctx.Writer, ctx.Request, nil)
	if err != nil {
		ctx.Error(err)
		return
	}
	defer conn.Close()

	requestId, exist := ctx.Get(appconstant.RequestId)
	if !exist {
		requestId = ""
	}
	path := ctx.Request.URL.Path

	chAuth := make(chan entity.WsToken)
	fromClient := make(chan []byte, 10)
	toClient := make(chan []byte, 10)
	chClose := make(chan bool, 10)

	defer close(chAuth)
	defer close(fromClient)
	defer close(toClient)
	defer close(chClose)

	go func() {
		wsToken := <-chAuth

		mutex.Lock()
		isAuthenticated = true
		mutex.Unlock()

		h.logger.WithFields(logrus.Fields{
			"path":       path,
			"request-id": requestId,
		}).Infof("open connection to centrifugo")

		err = h.wsUsecase.HandleCentrifugo(ctx.Request.Context(), wsToken, toClient, fromClient, chClose)
		if err != nil {
			h.logger.WithFields(logrus.Fields{
				"error":      fmt.Sprintf("error handling centrifugo: %s", err.Error()),
				"path":       path,
				"request-id": requestId,
			}).Error()
		}
	}()

	go func() {
		for {
			chat := <-toClient

			err := conn.WriteMessage(websocket.TextMessage, chat)
			if err != nil {
				if errors.Is(err, websocket.ErrCloseSent) {
					break
				}

				h.logger.WithFields(logrus.Fields{
					"error":      fmt.Sprintf("error writing message: %s", err.Error()),
					"path":       path,
					"request-id": requestId,
				}).Error()
				continue
			}
		}
	}()

	go func() {
		for {
			messageType, message, err := conn.ReadMessage()
			if err != nil {
				if websocket.IsUnexpectedCloseError(err) {
					chClose <- true
					break
				}

				h.logger.WithFields(logrus.Fields{
					"error":      fmt.Sprintf("error reading message: %s", err.Error()),
					"path":       path,
					"request-id": requestId,
				}).Warn()
				continue
			}

			if messageType == websocket.TextMessage {
				var wsMsg dto.WsMessage

				err := json.Unmarshal(message, &wsMsg)
				if err != nil {
					h.logger.WithFields(logrus.Fields{
						"error":      fmt.Sprintf("error unmarshal message: %s", err.Error()),
						"path":       path,
						"request-id": requestId,
					}).Warn()
				}

				if wsMsg.Type == "auth" {
					var authData dto.AuthWsData

					marshaled, _ := json.Marshal(wsMsg.Data)

					err := json.Unmarshal(marshaled, &authData)
					if err != nil {
						h.logger.WithFields(logrus.Fields{
							"error":      fmt.Sprintf("error unmarshal auth data: %s", err.Error()),
							"path":       path,
							"request-id": requestId,
						}).Warn()
					}

					chAuth <- dto.AuthWsDataToEntity(authData)

					continue
				}

				mutex.Lock()
				if !isAuthenticated {
					h.logger.WithFields(logrus.Fields{
						"error":      "request unauthenticated",
						"path":       path,
						"request-id": requestId,
					}).Warn()
					chClose <- true
					break
				}
				mutex.Unlock()

				if wsMsg.Type == "chat" {
					wsChatData, _ := json.Marshal(wsMsg.Data)

					fromClient <- wsChatData
				}

			}
		}
	}()

	<-chClose
	closeConn(conn)
}

func closeConn(conn *websocket.Conn) error {
	deadline := time.Now().Add(time.Minute)
	err := conn.WriteControl(
		websocket.CloseMessage,
		websocket.FormatCloseMessage(websocket.CloseNormalClosure, ""),
		deadline,
	)
	if err != nil {
		return err
	}

	err = conn.SetReadDeadline(time.Now().Add(5 * time.Second))
	if err != nil {
		return err
	}

	for {
		_, _, err = conn.NextReader()
		if websocket.IsCloseError(err, websocket.CloseNormalClosure) {
			break
		}
		if err != nil {
			break
		}
	}

	err = conn.Close()
	if err != nil {
		return err
	}
	return nil
}
