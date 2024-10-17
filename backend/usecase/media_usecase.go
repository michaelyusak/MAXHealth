package usecase

import (
	"context"
	"max-health/appconstant"
	"max-health/apperror"
	"max-health/util"
	"mime/multipart"
	"net/http"
)

type MediaUsecase interface {
	UploadMedia(ctx context.Context, file multipart.File, fileHeader *multipart.FileHeader) (string, error)
}

type mediaUsecaseImpl struct{}

func NewMediaUsecaseImpl() *mediaUsecaseImpl {
	return &mediaUsecaseImpl{}
}

func (u *mediaUsecaseImpl) UploadMedia(ctx context.Context, file multipart.File, fileHeader *multipart.FileHeader) (string, error) {
	filePath, _, err := util.ValidateFile(*fileHeader, appconstant.CategoryPicturesUrl, []string{"png", "jpg", "jpeg"}, 2000000)
	if err != nil {
		return "", apperror.NewAppError(http.StatusBadRequest, err, err.Error())
	}

	imageUrl, err := util.UploadToCloudinary(file, *filePath)
	if err != nil {
		return "", apperror.InternalServerError(err)
	}

	return imageUrl, nil
}
