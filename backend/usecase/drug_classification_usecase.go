package usecase

import (
	"context"

	"max-health/dto"
	"max-health/repository"
)

type DrugClassificationUsecase interface {
	GetAllDrugClassification(ctx context.Context) ([]dto.DrugClassification, error)
}

type drugClassficationUsecaseImpl struct {
	drugClassificationRepository repository.DrugClassificationRepository
}

func NewDrugClassificationUsecaseImpl(drugClassificationRepository repository.DrugClassificationRepository) drugClassficationUsecaseImpl {
	return drugClassficationUsecaseImpl{
		drugClassificationRepository: drugClassificationRepository,
	}
}

func (u *drugClassficationUsecaseImpl) GetAllDrugClassification(ctx context.Context) ([]dto.DrugClassification, error) {
	drugClassificationList, err := u.drugClassificationRepository.GetAllDrugClassification(ctx)
	if err != nil {
		return nil, err
	}

	drugClassificationListDTO := dto.ConvertToDrugClassificationListDTO(drugClassificationList)

	return drugClassificationListDTO, nil
}
