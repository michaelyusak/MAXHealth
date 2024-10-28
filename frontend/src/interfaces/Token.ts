export interface IToken {
  data: string;
  exp: number;
  iat: string;
  iss: string;
}

export interface ITokenData {
  exp: number;
  iat: string;
  iss: string;
  data: {
    [key: string]: string | number;
  };
}

export interface ITokenDataV2 {
  account_id: number;
  role: string;
}
