package event

import (
	"encoding/json"
	"time"
)

type EventType string

const (
	EventTypeMessageCreated EventType = "MESSAGE_CREATE"
	EventTypeMessageUpdated EventType = "MESSAGE_UPDATE"
	EventTypeMessageDeleted EventType = "MESSAGE_DELETE"
)

type Event struct {
	Type      EventType       `json:"type"`
	Timestamp time.Time       `json:"timestamp"`
	Data      json.RawMessage `json:"data"`
}
