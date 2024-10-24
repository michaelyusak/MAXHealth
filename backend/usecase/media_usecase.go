package usecase

import (
	"context"
	"max-health/appconstant"
	"max-health/apperror"
	"max-health/entity"
	"max-health/util"
	"mime/multipart"
	"net/http"
)

type MediaUsecase interface {
	UploadMedia(ctx context.Context, file multipart.File, fileHeader *multipart.FileHeader) (*entity.Attachment, error)
}

type mediaUsecaseImpl struct{}

func NewMediaUsecaseImpl() *mediaUsecaseImpl {
	return &mediaUsecaseImpl{}
}

func (u *mediaUsecaseImpl) UploadMedia(ctx context.Context, file multipart.File, fileHeader *multipart.FileHeader) (*entity.Attachment, error) {
	filePath, format, err := util.ValidateFile(*fileHeader, appconstant.CategoryPicturesUrl, []string{"png", "jpg", "jpeg"}, 2000000)
	if err != nil {
		return nil, apperror.NewAppError(http.StatusBadRequest, err, err.Error())
	}

	url, err := util.UploadToCloudinary(file, *filePath)
	if err != nil {
		return nil, apperror.InternalServerError(err)
	}

	return &entity.Attachment{
		Url:    &url,
		Format: format,
	}, nil
}
