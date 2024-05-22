package handler

import (
	"max-health/appconstant"
	"max-health/apperror"
	"max-health/dto"
	"max-health/usecase"
	"max-health/util"

	"github.com/gin-gonic/gin"
)

type StockHandler struct {
	StockUsecase usecase.StockUsecase
}

func NewStockHandler(stockUsecase usecase.StockUsecase) StockHandler {
	return StockHandler{
		StockUsecase: stockUsecase,
	}
}

func (h *StockHandler) GetAllStockChanges(ctx *gin.Context) {
	accountId, exists := ctx.Get(appconstant.AccountId)
	if !exists {
		ctx.Error(apperror.UnauthorizedError())
		return
	}

	var stockChangeQuery dto.StockChangeQuery

	if err := ctx.ShouldBindQuery(&stockChangeQuery); err != nil {
		ctx.Error(err)
		return
	}

	stockChanges, err := h.StockUsecase.GetAllStockChanges(ctx.Request.Context(), accountId.(int64), stockChangeQuery.PharmacyId)
	if err != nil {
		ctx.Error(err)
		return
	}

	util.ResponseOK(ctx, stockChanges)
}
