package dto

import "max-health/entity"

type TokensResponse struct {
	AccessToken  string `json:"access_token"`
	RefreshToken string `json:"refresh_token"`
}

func ConvertTokensToResponse(tokens entity.Tokens) TokensResponse {
	return TokensResponse{AccessToken: tokens.AccessToken, RefreshToken: tokens.RefreshToken}
}
