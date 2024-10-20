package dto

import "max-health/entity"

type WsMessage struct {
	Type string      `json:"type" binding:"required"`
	Data interface{} `json:"data"`
}

type AuthWsData struct {
	Channel      string `json:"channel" binding:"required"`
	ChannelToken string `json:"channel_token" binding:"required"`
	ClientToken  string `json:"client_token" binding:"required"`
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
