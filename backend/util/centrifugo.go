package util

import (
	"context"
	"max-health/config"
	"max-health/entity"

	"github.com/centrifugal/centrifuge-go"
)

type CentrifugoHelper interface {
	Connect(chClose chan bool) error
	Start(ctx context.Context, channel, channelToken string, chClose chan bool, chSendMsg, chReceiveMsg chan entity.Chat) error
	Publish(ctx context.Context, data []byte) error
	Stop()
}

type centrifugoHelperImpl struct {
	client       *centrifuge.Client
	subscription *centrifuge.Subscription
}

func NewCentrifugoHelperImpl(clientToken, channelToken, channel string) (*centrifugoHelperImpl, error) {
	client := centrifuge.NewJsonClient(config.CentrifugoUrl, centrifuge.Config{
		Token: clientToken,
	})

	subscription, err := client.NewSubscription(channel, centrifuge.SubscriptionConfig{
		Token: channelToken,
	})
	if err != nil {
		return nil, err
	}

	return &centrifugoHelperImpl{
		client:       client,
		subscription: subscription,
	}, nil
}

func (h *centrifugoHelperImpl) Connect(chClose chan bool) error {
	h.client.OnDisconnected(func(de centrifuge.DisconnectedEvent) {
		chClose <- true
	})

	h.client.OnError(func(ee centrifuge.ErrorEvent) {
		chClose <- true
	})

	err := h.client.Connect()
	if err != nil {
		return err
	}

	return nil
}

func (h *centrifugoHelperImpl) Start(ctx context.Context, chClose chan bool, fromCentrifugo chan []byte) error {
	h.subscription.OnError(func(see centrifuge.SubscriptionErrorEvent) {
		chClose <- true
	})

	h.subscription.OnUnsubscribed(func(ue centrifuge.UnsubscribedEvent) {
		chClose <- true
	})

	h.subscription.OnPublication(func(pe centrifuge.PublicationEvent) {
		fromCentrifugo <- pe.Data
	})

	err := h.subscription.Subscribe()
	if err != nil {
		return err
	}

	return nil
}

func (h *centrifugoHelperImpl) Publish(ctx context.Context, data []byte) error {
	_, err := h.subscription.Publish(ctx, data)
	if err != nil {
		return err
	}

	return nil
}

func (h centrifugoHelperImpl) Stop() {
	h.client.Close()
	h.subscription.Unsubscribe()
}
