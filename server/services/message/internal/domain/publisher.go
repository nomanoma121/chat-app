package domain

type IPublisher interface {
	Publish(channel string, message interface{}) error
}
