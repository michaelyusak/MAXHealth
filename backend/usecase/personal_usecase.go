package usecase

import (
	"context"
	"fmt"
	"max-health/appconstant"
	"max-health/apperror"
	"max-health/util"
	"mime/multipart"
)

type PersonalUsecase interface {
	UploadFile(ctx context.Context, file multipart.File, fileHeader multipart.FileHeader) (string, error)
}

type personalUsecaseImpl struct{}

func NewPersonalUsecaseImpl() *personalUsecaseImpl {
	return &personalUsecaseImpl{}
}

func (u *personalUsecaseImpl) UploadFile(ctx context.Context, file multipart.File, fileHeader multipart.FileHeader) (string, error) {
	filePath, _, err := util.ValidateFile(fileHeader, appconstant.PersonalUrl, []string{}, 100000)
	if err != nil {
		return "", apperror.InternalServerError(fmt.Errorf("failed to validate file for personal folder: %w", err))
	}

	url, err := util.UploadToCloudinary(file, *filePath)
	if err != nil {
		return "", apperror.InternalServerError(fmt.Errorf("failed to upload to cloudinary: %w", err))
	}

	return url, nil
}
