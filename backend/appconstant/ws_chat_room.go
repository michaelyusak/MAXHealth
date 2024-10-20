package appconstant

import "time"

const (
	// in minutes
	ChatRoomTokenDuration = 60

	ChatRoomDuration = time.Duration(30 * time.Minute)

	ChannelHeaderKey      = "Channel"
	ChannelTokenHeaderKey = "Channel-Token"
	ClientTokenHeaderKey  = "Client-Token"
)
