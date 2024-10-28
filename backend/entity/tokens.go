package entity

type Tokens struct {
	AccessToken  string
	RefreshToken string
}

type TokenData struct {
	AccountId int64
	Role      string
}
