package util

import (
	"math/rand"
	"time"

	"max-health/appconstant"
)

func GenerateCode(length int) string {
	seededRand := rand.New(rand.NewSource(time.Now().UnixNano()))

	b := make([]byte, length)
	for i := range b {
		b[i] = appconstant.CharSet[seededRand.Intn(len(appconstant.CharSet))]
	}

	return string(b)
}
