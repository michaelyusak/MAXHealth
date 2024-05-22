package handler

import (
	"max-health/usecase"
	"max-health/util"

	"github.com/gin-gonic/gin"
)

type DrugFormHandler struct {
	drugFormUsecase usecase.DrugFormUsecase
}

func NewDrugFormHandler(drugFormUsecase usecase.DrugFormUsecase) DrugFormHandler {
	return DrugFormHandler{
		drugFormUsecase: drugFormUsecase,
	}
}

func (h *DrugFormHandler) GetAllDrugForm(ctx *gin.Context) {
	ctx.Header("Content-Type", "application/json")

	drugFormList, err := h.drugFormUsecase.GetAllDrugForm(ctx.Request.Context())
	if err != nil {
		ctx.Error(err)
		return
	}

	util.ResponseOK(ctx, drugFormList)
}
