export interface IWsToken {
    token: ICentrifugoToken;
    channel: string
}

export interface ICentrifugoToken {
    client_token: string;
    channel_token: string;
}
