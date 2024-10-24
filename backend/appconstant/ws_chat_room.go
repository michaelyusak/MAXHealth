package appconstant

import "time"

const (
	// in minutes
	ChatRoomTokenDuration = 60

	ChatRoomDuration = time.Duration(30 * time.Minute)

	ChannelHeaderKey      = "channel"
	ChannelTokenHeaderKey = "channel-token"
	ClientTokenHeaderKey  = "client-token"
)
