import json
import logging

from caliopen_main.message.delivery import UserMessageDelivery

log = logging.getLogger(__name__)


class InboundEmail(object):
    def __init__(self, natsConn):
        self.deliver = UserMessageDelivery()
        self.natsConn = natsConn

    def handler(self, msg):
        nats_error = {
            'error': '',
            'message': 'inbound email message process failed'
        }
        nats_success = {
            'message': 'OK : inbound email message proceeded'
        }
        payload = json.loads(msg.data)
        if payload[u'order'] == "process_message":
            try:
                self.deliver.process_message(payload[u'user_id'],
                                             payload[u'message_id'])
            except Exception as exc:
                print("deliver process failed : {}".format(exc))
                nats_error['error'] = str(exc.message)
                self.natsConn.publish(msg.reply, json.dumps(nats_error))
                return exc
            self.natsConn.publish(msg.reply, json.dumps(nats_success))
        if payload[u'order'] == "process_email_raw":
            try:
                self.deliver.process_email_raw(payload[u'user_id'],
                                               payload[u'raw_msg_id'])
            except Exception as exc:
                print("deliver process failed : {}".format(exc))
                nats_error['error'] = str(exc.message)
                self.natsConn.publish(msg.reply, json.dumps(nats_error))
                return exc
            self.natsConn.publish(msg.reply, json.dumps(nats_success))
