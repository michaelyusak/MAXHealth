package handler

import (
	"max-health/apperror"

	"github.com/gin-gonic/gin"
)

func NotFoundHandler(c *gin.Context) {
	c.Error(apperror.NotFoundError())
}
