import { Message, Participant } from 'src/modules/message';
import { IDraftMessagePayload } from 'src/modules/message/types';
import { calcSyncDraft } from './calcSyncDraft';

describe('modules identity - service - calcSyncDraft', () => {
  const messageBase: Message = {
    message_id: '111',
    discussion_id: '112',
    subject: '',
    body: '',
    user_identities: [],
    is_unread: true,
    protocol: 'whatever',
    participants: [],
    tags: [],
    date: '',
    date_insert: '',
    is_answered: false,
    is_draft: true,
    raw_msg_id: '111',
    user_id: '114',
  };
  const draftBase: IDraftMessagePayload = {
    user_identities: [],
  };
  const participantBase: Participant = {
    address: '',
    protocol: '',
    type: 'To',
  };
  it('update body', () => {
    const draft = {
      ...draftBase,
      message_id: '111',
      participants: [],
      body: 'new body',
    };
    const message = {
      ...messageBase,
      body: 'old body',
      message_id: '111',
      discussion_id: '112',
    };
    expect(calcSyncDraft(draft, message)).toMatchInlineSnapshot(`
      Object {
        "body": "new body",
        "date": "",
        "date_insert": "",
        "discussion_id": "112",
        "identity_id": "",
        "is_answered": false,
        "is_draft": true,
        "is_unread": true,
        "message_id": "111",
        "parent_id": undefined,
        "protocol": "whatever",
        "raw_msg_id": "111",
        "recipients": Array [],
        "subject": undefined,
        "tags": Array [],
        "user_id": "114",
        "user_identities": Array [],
      }
    `);
  });

  it('message with new attachments', () => {
    const draft = {
      ...draftBase,
      message_id: '111',
      participants: [],
      body: 'new body',
      attachments: [{ file_name: 'foo.png', temp_id: 'aabbb111' }],
    };
    const message = {
      ...messageBase,
      body: 'old body',
      message_id: '111',
      discussion_id: '112',
      attachments: [
        { file_name: 'foo.png', temp_id: 'aabbb111' },
        { file_name: 'bar.png', temp_id: 'aabbb222' },
      ],
    };
    expect(calcSyncDraft(draft, message)).toMatchInlineSnapshot(`
      Object {
        "attachments": Array [
          Object {
            "file_name": "foo.png",
            "temp_id": "aabbb111",
          },
          Object {
            "file_name": "bar.png",
            "temp_id": "aabbb222",
          },
        ],
        "body": "new body",
        "date": "",
        "date_insert": "",
        "discussion_id": "112",
        "identity_id": "",
        "is_answered": false,
        "is_draft": true,
        "is_unread": true,
        "message_id": "111",
        "parent_id": undefined,
        "protocol": "whatever",
        "raw_msg_id": "111",
        "recipients": Array [],
        "subject": undefined,
        "tags": Array [],
        "user_id": "114",
        "user_identities": Array [],
      }
    `);
  });

  it('message with removed attachments', () => {
    const draft = {
      ...draftBase,
      message_id: '111',
      participants: [],
      body: 'new body',
      attachments: [{ file_name: 'foo.png', temp_id: 'aabbb111' }],
    };
    const message = {
      ...messageBase,
      body: 'old body',
      message_id: '111',
      discussion_id: '112',
    };
    expect(calcSyncDraft(draft, message)).toMatchInlineSnapshot(`
      Object {
        "body": "new body",
        "date": "",
        "date_insert": "",
        "discussion_id": "112",
        "identity_id": "",
        "is_answered": false,
        "is_draft": true,
        "is_unread": true,
        "message_id": "111",
        "parent_id": undefined,
        "protocol": "whatever",
        "raw_msg_id": "111",
        "recipients": Array [],
        "subject": undefined,
        "tags": Array [],
        "user_id": "114",
        "user_identities": Array [],
      }
    `);
  });

  describe('participants', () => {
    it('uses the participants of up to date message', () => {
      const draft = {
        ...draftBase,
        message_id: '111',
        participants: [],
        parent_id: 'aabbb1',
        body: 'new body',
        attachments: [{ file_name: 'foo.png', temp_id: 'aabbb111' }],
        discussion_id: '112',
      };
      const message = {
        ...messageBase,
        participants: [
          { ...participantBase, participant_id: '01' },
          { ...participantBase, participant_id: '02' },
        ],
        parent_id: 'aabbb0',
        body: 'old body',
        message_id: '111',
        discussion_id: '112',
      };
      expect(calcSyncDraft(draft, message)).toMatchInlineSnapshot(`
        Object {
          "body": "new body",
          "date": "",
          "date_insert": "",
          "discussion_id": "112",
          "identity_id": "",
          "is_answered": false,
          "is_draft": true,
          "is_unread": true,
          "message_id": "111",
          "parent_id": "aabbb1",
          "protocol": "whatever",
          "raw_msg_id": "111",
          "recipients": Array [
            Object {
              "address": "",
              "participant_id": "01",
              "protocol": "",
              "type": "To",
            },
            Object {
              "address": "",
              "participant_id": "02",
              "protocol": "",
              "type": "To",
            },
          ],
          "subject": undefined,
          "tags": Array [],
          "user_id": "114",
          "user_identities": Array [],
        }
      `);
    });
  });
});
