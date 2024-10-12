package util

import (
	"crypto/rand"
	"math/big"
	"strconv"
	"time"
)

func GenerateRandomString() (string, error) {
	base62Chars := "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz"
	idLength := 5

	var randomString string
	for i := 0; i < idLength; i++ {
		index, err := rand.Int(rand.Reader, big.NewInt(int64(len(base62Chars))))
		if err != nil {
			return "", err
		}

		randomString += string(base62Chars[index.Int64()])
	}

	nano := time.Now().UnixMicro()

	nanoStr := strconv.Itoa(int(nano))

	randomString += nanoStr

	return randomString, nil
}
