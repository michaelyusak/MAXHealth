package dto

import (
	"max-health/entity"
	"time"
)

type RoomPreviewResponse struct {
	Id                    int64      `json:"id"`
	Hash                  string     `json:"hash"`
	ParticipantName       string     `json:"participant_name"`
	ParticipantPictureUrl string     `json:"participant_picture_url"`
	ExpiredAt             *time.Time `json:"expired_at,omitempty"`
	LastChat              Chat       `json:"last_chat"`
}

type RoomListResponse struct {
	Pending []RoomPreviewResponse `json:"pending"`
	OnGoing []RoomPreviewResponse `json:"on_going"`
	Expired []RoomPreviewResponse `json:"expired"`
}

func ToRoomPreviewResponse(room entity.WsChatRoomPreview) RoomPreviewResponse {
	return RoomPreviewResponse{
		Id:                    room.Id,
		Hash:                  room.Hash,
		ParticipantName:       room.ParticipantName,
		ParticipantPictureUrl: room.ParticipantPictureUrl,
		ExpiredAt:             room.ExpiredAt,
		LastChat:              ConvertToChatDTO(room.LastChat),
	}
}

func ToRoomListResponse(roomList []entity.WsChatRoomPreview) RoomListResponse {
	pending := []RoomPreviewResponse{}
	onGoing := []RoomPreviewResponse{}
	expired := []RoomPreviewResponse{}

	for _, room := range roomList {
		roomResponse := ToRoomPreviewResponse(room)

		if roomResponse.ExpiredAt == nil {
			pending = append(pending, roomResponse)
			continue
		}

		if roomResponse.ExpiredAt.After(time.Now()) {
			onGoing = append(onGoing, roomResponse)
			continue
		}

		expired = append(expired, roomResponse)
		continue
	}

	return RoomListResponse{
		Pending: pending,
		OnGoing: onGoing,
		Expired: expired,
	}
}
