package util

import (
	"max-health/dto"
	"max-health/entity"
	"time"
)

func ComposeRoomListResponse(roomList []entity.WsChatRoomPreview) dto.RoomListResponse {
	var pending []dto.RoomPreviewResponse
	var onGoing []dto.RoomPreviewResponse
	var expired []dto.RoomPreviewResponse

	for _, room := range roomList {
		roomResponse := dto.ToRoomPreviewResponse(room)

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

	return dto.RoomListResponse{
		Pending: pending,
		OnGoing: onGoing,
		Expired: expired,
	}
}
