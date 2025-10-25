package event

import (
	"encoding/json"
)

type EventType string

const (
	EventTypeMessageCreated EventType = "MESSAGE_CREATE"
	EventTypeMessageUpdated EventType = "MESSAGE_UPDATE"
	EventTypeMessageDeleted EventType = "MESSAGE_DELETE"

	EventTypeSubscribeChannels EventType = "SUBSCRIBE_CHANNELS"

	EventTypeAuth        EventType = "AUTH_REQUEST"
	EventTypeAuthError   EventType = "AUTH_ERROR"
	EventTypeAuthSuccess EventType = "AUTH_SUCCESS"
)

type Event struct {
	Type EventType       `json:"type"`
	Data json.RawMessage `json:"data"`
}
