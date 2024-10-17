package handler

import "max-health/usecase"

type MediaHandler struct {
	mediaUsecase usecase.MediaUsecase
}

func NewMediaHandler(mediaUsecase usecase.MediaUsecase) *MediaHandler {
	return &MediaHandler{
		mediaUsecase: mediaUsecase,
	}
}
