package usecase

type MediaUsecase interface {}

type mediaUsecaseImpl struct {}

func NewMediaUsecaseImpl() *mediaUsecaseImpl {
	return &mediaUsecaseImpl{}
}