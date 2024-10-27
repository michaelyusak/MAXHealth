package database

const (
	FindWsChatRoomQuery = `
		SELECT ws_chat_room_id, room_hash, user_account_id, doctor_account_id, expired_at
		FROM ws_chat_rooms
		WHERE user_account_id = $1 
		AND doctor_account_id = $2
		AND deleted_at IS NULL
		AND expired_at IS NOT NULL
		ORDER BY created_at DESC
		LIMIT 1;
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

	GetAllWsRoomQuery = `
		SELECT cr.ws_chat_room_id, cr.room_hash, a.account_name, a.profile_picture, c.chat_message, attachment_format, c.attachment_url, cr.expired_at,
			CASE 
				WHEN c.chat_message IS NULL THEN cr.created_at
				ELSE c.created_at
			END
		FROM ws_chat_rooms cr 
		JOIN accounts a  ON a.account_id  =
			CASE
				WHEN cr.user_account_id = $1 THEN cr.doctor_account_id
				WHEN cr.doctor_account_id = $1 THEN cr.user_account_id
			END
		LEFT JOIN chats c ON c.chat_id = 
			(SELECT c2.chat_id
			FROM chats c2
			WHERE c2.chat_room_id = cr.ws_chat_room_id 
			ORDER BY created_at DESC limit 1)
		WHERE cr.deleted_at IS NULL AND 
			CASE
				WHEN cr.user_account_id = $1 THEN cr.user_account_id = $1
				WHEN cr.doctor_account_id = $1 THEN cr.doctor_account_id = $1
			END
		ORDER BY created_at DESC;
	`

	FindWsChatRoomByIdQuery = `
		SELECT room_hash, user_account_id, doctor_account_id, doctors.certificate, expired_at
		FROM ws_chat_rooms
		LEFT JOIN doctors ON doctors.account_id = ws_chat_rooms.doctor_account_id
		WHERE ws_chat_room_id = $1 
		AND ws_chat_rooms.deleted_at IS NULL
	`

	CloseWsChatRoomQuery = `
		UPDATE ws_chat_rooms
		SET expired_at = $2, updated_at = NOW()
		WHERE ws_chat_room_id = $1
	`

	StartWsChatQuery = `
		UPDATE ws_chat_rooms
		SET expired_at = $2
		WHERE ws_chat_room_id = $1
		AND expired_at IS NULL
		AND deleted_at IS NULL
	`
)
