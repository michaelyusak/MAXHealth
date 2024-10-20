package dto

import "max-health/entity"

type WsMessage struct {
	Type string      `json:"type" validate:"required"`
	Data interface{} `json:"data"`
}

type AuthWsData struct {
	Channel      string `json:"channel" validate:"required,min=1"`
	ChannelToken string `json:"channel_token" validate:"required,min=1"`
	ClientToken  string `json:"client_token" validate:"required,min=1"`
}

type WsChatData struct {
	Channel           string                    `json:"channel" validate:"required,min=1"`
	Side              int                       `json:"side" validate:"required,gte=1"`
	Message           string                    `json:"message" validate:"required,min=1"`
	Attachment        Attachment                `json:"attachment"`
	PrescriptionDrugs []PrescriptionDrugRequest `json:"prescription_drugs"`
}

func AuthWsDataToEntity(dto AuthWsData) entity.WsToken {
	return entity.WsToken{
		Channel: dto.Channel,
		Token: entity.CentrifugoToken{
			ChannelToken: dto.ChannelToken,
			ClientToken:  dto.ClientToken,
		},
	}
}

func ToChatEntity(dto WsChatData) (string, int, entity.Chat) {
	return dto.Channel, dto.Side, entity.Chat{
		Message:      &dto.Message,
		Attachment:   ToAttachmentEntity(dto.Attachment),
		Prescription: ConvertToPrescriptionEntity(dto.PrescriptionDrugs),
	}
}
