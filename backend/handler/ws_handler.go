package handler

import (
	"context"
	"max-health/appconstant"
	"max-health/apperror"
	"max-health/dto"
	"max-health/usecase"
	"max-health/util"

	"github.com/gin-gonic/gin"
)

type WsHandler struct {
	wsUsecase usecase.WsUsecase
}

func NewWsHandler(wsUsecase usecase.WsUsecase) *WsHandler {
	return &WsHandler{
		wsUsecase: wsUsecase,
	}
}

func (h *WsHandler) CreateRoom(ctx *gin.Context) {
	ctx.Header("Content-Type", "application/json")

	userAccountId, exists := ctx.Get(appconstant.AccountId)
	if !exists {
		ctx.Error(apperror.UnauthorizedError())
		return
	}

	var req dto.CreateWsRoomReq
	err := ctx.ShouldBindJSON(&req)
	if err != nil {
		ctx.Error(err)
		return
	}

	chatRoom, err := h.wsUsecase.CreateRoom(ctx.Request.Context(), userAccountId.(int64), req.DoctorAccountId)
	if err != nil {
		ctx.Error(err)
		return
	}

	util.ResponseOK(ctx, dto.ToWsChatRoomRes(*chatRoom))
}

func (h *WsHandler) GenerateToken(ctx *gin.Context) {
	ctx.Header("Content-Type", "application/json")

	userAccountId, exists := ctx.Get(appconstant.AccountId)
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

	c := context.WithValue(ctx, appconstant.AccountIdKey, userAccountId)

	wsToken, err := h.wsUsecase.GenerateToken(c, req.RoomHash)
	if err != nil {
		ctx.Error(err)
		return
	}

	util.ResponseOK(ctx, dto.ToWsTokenDTO(wsToken))
}
