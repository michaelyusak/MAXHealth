package entity

type WsToken struct {
	Token   CentrifugoToken
	Channel string
}

type CentrifugoToken struct {
	ClientToken  string
	ChannelToken string
}
