package handler

import (
	"max-health/usecase"
	"max-health/util"

	"github.com/gin-gonic/gin"
)

type DrugClassificationHandler struct {
	drugClassificationUsecase usecase.DrugClassificationUsecase
}

func NewDrugClassificationHandler(drugClassificationUsecase usecase.DrugClassificationUsecase) DrugClassificationHandler {
	return DrugClassificationHandler{
		drugClassificationUsecase: drugClassificationUsecase,
	}
}

func (h *DrugClassificationHandler) GetAllDrugClassification(ctx *gin.Context) {
	ctx.Header("Content-Type", "application/json")

	drugClassificationList, err := h.drugClassificationUsecase.GetAllDrugClassification(ctx.Request.Context())
	if err != nil {
		ctx.Error(err)
		return
	}

	util.ResponseOK(ctx, drugClassificationList)
}
