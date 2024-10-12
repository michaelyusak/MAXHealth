package database

const (
	FindWsChatRoomQuery = `
		SELECT ws_chat_room_id, room_hash, user_account_id, doctor_account_id, expired_at
		FROM ws_chat_rooms
		WHERE
		user_account_id = $1 
		AND doctor_account_id = $2
		AND deleted_at IS NULL
		LIMIT 1
	`

	CreateWsChatRoomQuery = `
		INSERT INTO ws_chat_rooms (room_hash, user_account_id, doctor_account_id, expired_at)
		VALUES ($1, $2, $3, $4)
		RETURNING ws_chat_room_id
	`

	FindWsChatRoomByHashQuery = `
		SELECT ws_chat_room_id, user_account_id, doctor_account_id, expired_at
		FROM ws_chat_rooms
		WHERE
		room_hash = $1 
		AND deleted_at IS NULL
		LIMIT 1
	`
)
