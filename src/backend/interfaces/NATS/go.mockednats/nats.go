package mockednats

import (
	"time"
)

// NatsConn ..
type NatsConn struct{}

// NatsOptions ..
type NatsOptions struct{}

// NatsMsg ..
type NatsMsg struct {
	Subject string
	Reply   string
	Data    []byte
	Sub     *NatsSubscription
}

// NatsSubscription ..
type NatsSubscription struct{}

// NatsConnect ..
func NatsConnect(url string, options ...NatsOptions) (*NatsConn, error) {
	return &NatsConn{}, nil
}

// Close ..
func (nc *NatsConn) Close() {}

// Request ..
func (nc *NatsConn) Request(subj string, data []byte, timeout time.Duration) (*NatsMsg, error) {
	return &NatsMsg{}, nil
}

// Publish ..
func (nc *NatsConn) Publish(subj string, data []byte) error {
	return nil
}
