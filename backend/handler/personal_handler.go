package handler

import (
	"errors"
	"max-health/apperror"
	"max-health/usecase"
	"net/http"

	"github.com/gin-gonic/gin"
)

type PersonalHandler struct {
	personalUsecase usecase.PersonalUsecase
}

func NewPersonalHandler(personalUsecase usecase.PersonalUsecase) *PersonalHandler {
	return &PersonalHandler{
		personalUsecase: personalUsecase,
	}
}

func (h *PersonalHandler) UploadFile(ctx *gin.Context) {
	ctx.Header("Content-Type", "application/json")

	file, fileHeader, err := ctx.Request.FormFile("file")
	if err != nil {
		if file == nil {
			ctx.Error(apperror.NewAppError(http.StatusBadRequest, errors.New("file not attached"), "file not attached"))
			return
		}
		ctx.Error(err)
		return
	}

	url, err := h.personalUsecase.UploadFile(ctx.Request.Context(), file, *fileHeader)
	if err != nil {
		ctx.Error(err)
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"message": "OK",
		"data": gin.H{
			"file_url": url,
		},
	})
}
