package middleware

import (
	"net/http"
	"strings"

	"max-health/appconstant"
	"max-health/config"
	"max-health/dto"
	"max-health/util"

	"github.com/gin-gonic/gin"
)

func AuthMiddleware(tokenAuth util.TokenAuthentication, config *config.Config) gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.Request.Header.Get(appconstant.AuthorizationHeader)
		t := strings.Split(authHeader, " ")

		if len(t) != 2 || t[0] != appconstant.Bearer {
			c.AbortWithStatusJSON(http.StatusUnauthorized, dto.ErrorResponse{Message: appconstant.MsgUnauthorized})
			return
		}

		authToken := t[1]

		claims, err := tokenAuth.ParseAndVerify(authToken, config.AccessSecret)
		if err != nil {
			c.AbortWithStatusJSON(http.StatusUnauthorized, dto.ErrorResponse{Message: appconstant.MsgUnauthorized})
			return
		}

		c.Set(appconstant.AccountId, claims.AccountId)
		c.Set(appconstant.Role, claims.Role)
		c.Next()
	}
}

func UserAuthorizationMiddleware(c *gin.Context) {
	role, exists := c.Get(appconstant.Role)
	if exists && role == appconstant.UserRoleName {
		c.Next()
		return
	}
	c.AbortWithStatusJSON(http.StatusUnauthorized, dto.ErrorResponse{Message: appconstant.MsgUnauthorized})
}

func DoctorAuthorizationMiddleware(c *gin.Context) {
	role, exists := c.Get(appconstant.Role)
	if exists && role == appconstant.DoctorRoleName {
		c.Next()
		return
	}
	c.AbortWithStatusJSON(http.StatusUnauthorized, dto.ErrorResponse{Message: appconstant.MsgUnauthorized})
}

func PharmacyManagerAuthorizationMiddleware(c *gin.Context) {
	role, exists := c.Get(appconstant.Role)
	if exists && role == appconstant.PharmacyManagerRoleName {
		c.Next()
		return
	}
	c.AbortWithStatusJSON(http.StatusUnauthorized, dto.ErrorResponse{Message: appconstant.MsgUnauthorized})
}

func AdminAuthorizationMiddleware(c *gin.Context) {
	role, exists := c.Get(appconstant.Role)
	if exists && role == appconstant.AdminRoleName {
		c.Next()
		return
	}
	c.AbortWithStatusJSON(http.StatusUnauthorized, dto.ErrorResponse{Message: appconstant.MsgUnauthorized})
}
