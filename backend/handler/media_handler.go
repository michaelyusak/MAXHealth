package handler

import (
	"max-health/appconstant"
	"max-health/apperror"
	"max-health/dto"
	"max-health/usecase"
	"max-health/util"

	"github.com/gin-gonic/gin"
)

type MediaHandler struct {
	mediaUsecase usecase.MediaUsecase
}

func NewMediaHandler(mediaUsecase usecase.MediaUsecase) *MediaHandler {
	return &MediaHandler{
		mediaUsecase: mediaUsecase,
	}
}

func (h *MediaHandler) UploadMedia(ctx *gin.Context) {
	ctx.Header("Content-Type", "application/json")

	_, exists := ctx.Get(appconstant.AccountId)
	if !exists {
		ctx.Error(apperror.UnauthorizedError())
		return
	}

	file, fileHeader, err := ctx.Request.FormFile("file")
	if err != nil {
		if file != nil {
			ctx.Error(apperror.FileNotAttachedError())
			return
		}

		ctx.Error(err)
		return
	}

	attachment, err := h.mediaUsecase.UploadMedia(ctx.Request.Context(), file, fileHeader)
	if err != nil {
		ctx.Error(err)
		return
	}

	util.ResponseOK(ctx, dto.ToAttachmentResponse(*attachment))
}
