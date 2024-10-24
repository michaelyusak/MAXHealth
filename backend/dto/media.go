package dto

import "max-health/entity"

type AttachmentResponse struct {
	Url    string `json:"url"`
	Format string `json:"format"`
}

func ToAttachmentResponse(attachment entity.Attachment) AttachmentResponse {
	var url string
	var format string

	if attachment.Url != nil {
		url = *attachment.Url
	}

	if attachment.Format != nil {
		format = *attachment.Format
	}

	return AttachmentResponse{
		Url:    url,
		Format: format,
	}
}
