package util

import (
	"net/http"

	"max-health/appconstant"
	"max-health/dto"

	"github.com/gin-gonic/gin"
)

func ResponseOK(ctx *gin.Context, res any) {
	ctx.JSON(http.StatusOK, dto.Response{Message: appconstant.MsgOK, Data: res})
}

func ResponseCreated(ctx *gin.Context, res any) {
	ctx.JSON(http.StatusCreated, dto.Response{Message: appconstant.MsgCreated, Data: res})
}
