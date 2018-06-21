/*
 * // Copyleft (ɔ) 2018 The Caliopen contributors.
 * // Use of this source code is governed by a GNU AFFERO GENERAL PUBLIC
 * // license (AGPL) that can be found in the LICENSE file.
 */

package objects

// IMAPfetchOrder is model for message sent on topic 'IMAPfetcher' in NATS's queue 'IMAPworkers'
type IMAPfetchOrder struct {
	Order    string
	UserId   string
	RemoteId string
	// optional fields sent by imapctl
	Server   string
	Mailbox  string
	Login    string
	Password string
}

// DeliveryAck holds reply from nats when using request/reply system
type DeliveryAck struct {
	EmailMessage *EmailMessage `json:"-"`
	Err          bool          `json:"error"`
	Response     string        `json:"message,omitempty"`
}
