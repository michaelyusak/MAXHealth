package config

import (
	"os"
	"strconv"
	"strings"

	"github.com/joho/godotenv"
	"github.com/sirupsen/logrus"
)

type Config struct {
	Port                string
	FEPort              string
	DbUrl               string
	Issuer              string
	SendEmailIdentity   string
	SendEmailUsername   string
	SendEmailPassword   string
	SendEmailHost       string
	SendEmailPort       string
	VerifSecret         string
	AccessSecret        string
	RefreshSecret       string
	ResetPasswordSecret string
	CentrifugoSecret    string
	RajaOngkirApiKey    string
	HashCost            int
	GracefulPeriod      int
	PersonalPassword    string
	AllowOrigins        []string
}

var (
	EmailHost     string
	CentrifugoUrl string
)

func Init(log *logrus.Logger) *Config {
	err := godotenv.Load()
	if err != nil {
		log.Fatal("error loading .env file")
	}

	EmailHost = os.Getenv("EMAIL_HOST")
	CentrifugoUrl = os.Getenv("CENTRIFUGO_URL")

	hashCost, err := strconv.Atoi(os.Getenv("HASH_COST"))
	if err != nil {
		log.WithFields(logrus.Fields{
			"error": "HASH_COST must be integer",
		}).Fatal("error loading .env file")
	}

	gracefulPeriod, err := strconv.Atoi(os.Getenv("GRACEFUL_PERIOD"))
	if err != nil {
		log.WithFields(logrus.Fields{
			"error": "GRACEFUL_PERIOD must be integer",
		}).Fatal("error loading .env file")
	}

	allowOriginsStr := os.Getenv("ALLOW_ORIGINS")

	allowOrigins := strings.Split(allowOriginsStr, ",")

	return &Config{
		Port:                os.Getenv("BE_PORT"),
		FEPort:              os.Getenv("FE_PORT"),
		DbUrl:               os.Getenv("DATABASE_URL"),
		Issuer:              os.Getenv("ISSUER"),
		SendEmailIdentity:   os.Getenv("SEND_EMAIL_IDENTITY"),
		SendEmailUsername:   os.Getenv("SEND_EMAIL_USERNAME"),
		SendEmailPassword:   os.Getenv("SEND_EMAIL_PASSWORD"),
		SendEmailHost:       os.Getenv("SEND_EMAIL_HOST"),
		SendEmailPort:       os.Getenv("SEND_EMAIL_PORT"),
		VerifSecret:         os.Getenv("VERIFICATION_CODE_SECRET_KEY"),
		AccessSecret:        os.Getenv("ACCESS_TOKEN_SECRET_KEY"),
		RefreshSecret:       os.Getenv("REFRESH_TOKEN_SECRET_KEY"),
		ResetPasswordSecret: os.Getenv("RESET_PASSWORD_SECRET_KEY"),
		CentrifugoSecret:    os.Getenv("CENTRIFUGO_SECRET"),
		RajaOngkirApiKey:    os.Getenv("RAJA_ONGKIR_API_KEY"),
		HashCost:            hashCost,
		GracefulPeriod:      gracefulPeriod,
		PersonalPassword:    os.Getenv("PERSONAL_PASSWORD"),
		AllowOrigins:        allowOrigins,
	}
}
