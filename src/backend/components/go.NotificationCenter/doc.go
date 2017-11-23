// Copyleft (ɔ) 2017 The Caliopen contributors.
// Use of this source code is governed by a GNU AFFERO GENERAL PUBLIC
// license (AGPL) that can be found in the LICENSE file.

// NotificationCenter is a service to manage asynchronous notifications queues for users
// It catches notification orders from nats message queuing system,
// stores notifications queue for each user,
// and finally handles/throttles the delivery of notification to users by any mean (websocket, email, sms…).
package NotificationCenter
