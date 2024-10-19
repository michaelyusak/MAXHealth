package handler

import (
	"max-health/appconstant"
	"max-health/apperror"
	"max-health/dto"
	"max-health/usecase"
	"max-health/util"
	"strconv"

	"github.com/gin-gonic/gin"
)

type ChatRoomHandler struct {
	chatRoomUsecase usecase.ChatRoomUsecasae
}

func NewChatRoomHandler(chatRoomUsecase usecase.ChatRoomUsecasae) *ChatRoomHandler {
	return &ChatRoomHandler{
		chatRoomUsecase: chatRoomUsecase,
	}
}

func (h *ChatRoomHandler) GetAllRooms(ctx *gin.Context) {
	ctx.Header("Content-Type", "application/json")

	accountId, exists := ctx.Get(appconstant.AccountId)
	if !exists {
		ctx.Error(apperror.UnauthorizedError())
		return
	}

	role, exists := ctx.Get(appconstant.Role)
	if !exists {
		ctx.Error(apperror.UnauthorizedError())
		return
	}
	if role != appconstant.DoctorRoleName && role != appconstant.UserRoleName {
		ctx.Error(apperror.UnauthorizedError())
		return
	}

	roomList, err := h.chatRoomUsecase.GetAllRooms(ctx.Request.Context(), accountId.(int64))
	if err != nil {
		ctx.Error(err)
		return
	}

	util.ResponseOK(ctx, dto.ToRoomListResponse(roomList))
}

func (h *ChatRoomHandler) UserCreateRoom(ctx *gin.Context) {
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

	chatRoom, err := h.chatRoomUsecase.UserCreateRoom(ctx.Request.Context(), userAccountId.(int64), req.DoctorAccountId)
	if err != nil {
		ctx.Error(err)
		return
	}

	util.ResponseOK(ctx, dto.ToWsChatRoomRes(*chatRoom))
}

func (h *ChatRoomHandler) CloseChatRoom(ctx *gin.Context) {
	ctx.Header("Content-Type", "application/json")

	accountId, exists := ctx.Get(appconstant.AccountId)
	if !exists {
		ctx.Error(apperror.UnauthorizedError())
		return
	}

	roomIdStr := ctx.Param(appconstant.RoomIdString)

	roomId, err := strconv.Atoi(roomIdStr)
	if err != nil {
		ctx.Error(apperror.BadRequestError(err))
		return
	}

	err = h.chatRoomUsecase.CloseChatRoom(ctx.Request.Context(), accountId.(int64), int64(roomId))
	if err != nil {
		ctx.Error(err)
		return
	}

	util.ResponseOK(ctx, nil)
}

func (h *ChatRoomHandler) DoctorJoinRoom(ctx *gin.Context) {
	ctx.Header("Content-Type", "application/json")

	doctorAccountId, exists := ctx.Get(appconstant.AccountId)
	if !exists {
		ctx.Error(apperror.UnauthorizedError())
		return
	}

	roomIdStr := ctx.Param(appconstant.RoomIdString)

	roomId, err := strconv.Atoi(roomIdStr)
	if err != nil {
		ctx.Error(apperror.BadRequestError(err))
		return
	}

	err = h.chatRoomUsecase.DoctorJoinRoom(ctx.Request.Context(), doctorAccountId.(int64), int64(roomId))
	if err != nil {
		ctx.Error(err)
		return
	}

	util.ResponseOK(ctx, nil)
}

func (h *ChatRoomHandler) GetRoomDetail(ctx *gin.Context) {
	ctx.Header("Content-Type", "application/json")

	accountId, exists := ctx.Get(appconstant.AccountId)
	if !exists {
		ctx.Error(apperror.UnauthorizedError())
		return
	}

	roomIdStr := ctx.Param(appconstant.RoomIdString)

	roomId, err := strconv.Atoi(roomIdStr)
	if err != nil {
		ctx.Error(apperror.BadRequestError(err))
		return
	}

	roomDetail, err := h.chatRoomUsecase.GetRoomDetail(ctx.Request.Context(), accountId.(int64), int64(roomId))
	if err != nil {
		ctx.Error(err)
		return
	}

	util.ResponseOK(ctx, dto.ToWsChatRoomRes(*roomDetail))
}