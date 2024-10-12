package dto

import "max-health/entity"

type WsTokenRes struct {
	Token   CentrifugoTokenRes `json:"token"`
	Channel string             `json:"channel"`
}

type CentrifugoTokenRes struct {
	ClientToken  string `json:"client_token"`
	ChannelToken string `json:"channel_token"`
}

type CreateWsRoomReq struct {
	DoctorAccountId int64 `json:"doctor_account_id" binding:"required,gte=1"`
}

type GenerateTokenReq struct {
	RoomHash string `json:"room_hash" binding:"required"`
}

func ToWsTokenDTO(wsToken entity.WsToken) WsTokenRes {
	return WsTokenRes{
		Channel: wsToken.Channel,
		Token:   CentrifugoTokenRes(wsToken.Token),
	}
}
