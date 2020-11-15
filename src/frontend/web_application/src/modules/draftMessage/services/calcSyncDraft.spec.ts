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
    participant_id: '113',
    address: '',
    protocol: '',
    type: 'To',
  };
  it('simple newer message', () => {
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
    expect(calcSyncDraft(draft, message)).toEqual({
      recipients: [],
      body: 'new body',
      message_id: '111',
      discussion_id: '112',
    });
  });

  it('should write discussion_id or read only props', () => {
    const draft = {
      ...draftBase,
      message_id: '111',
      participants: [],
      body: 'new body',
      discussion_id: undefined,
    };
    const message = {
      ...messageBase,
      body: 'old body',
      message_id: '111',
      discussion_id: '112',
      tags: ['foo'],
    };
    expect(calcSyncDraft(draft, message)).toEqual({
      recipients: [],
      body: 'new body',
      message_id: '111',
      discussion_id: '112',
      tags: ['foo'],
    });
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
    expect(calcSyncDraft(draft, message)).toEqual({
      recipients: [],
      body: 'new body',
      message_id: '111',
      discussion_id: '112',
      attachments: [
        { file_name: 'foo.png', temp_id: 'aabbb111' },
        { file_name: 'bar.png', temp_id: 'aabbb222' },
      ],
    });
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
    expect(calcSyncDraft(draft, message)).toEqual({
      recipients: [],
      body: 'new body',
      message_id: '111',
      discussion_id: '112',
    });
  });

  describe('parent_id', () => {
    it('uses draft when in discussion', () => {
      const draft = {
        ...draftBase,
        message_id: '111',
        parent_id: 'aabbb1',
        participants: [],
        body: 'new body',
        discussion_id: '112',
      };
      const message = {
        ...messageBase,
        parent_id: 'aabbb0',
        participants: [
          { ...participantBase, participant_id: '01' },
          { ...participantBase, participant_id: '02' },
        ],
        body: 'old body',
        message_id: '111',
        discussion_id: '112',
      };
      expect(calcSyncDraft(draft, message)).toEqual({
        parent_id: 'aabbb1',
        recipients: [{ participant_id: '01' }, { participant_id: '02' }],
        body: 'new body',
        message_id: '111',
        discussion_id: '112',
      });
    });
    it('uses message when in compose', () => {
      const draft = {
        ...draftBase,
        message_id: '111',
        participants: [
          { ...participantBase, participant_id: '01' },
          { ...participantBase, participant_id: '02' },
        ],
        body: 'new body',
        discussion_id: '112',
      };
      const message = {
        ...messageBase,
        parent_id: 'aabbb0',
        participants: [{ ...participantBase, participant_id: '01' }],
        body: 'old body',
        message_id: '111',
        discussion_id: '112',
      };
      expect(calcSyncDraft(draft, message)).toEqual({
        parent_id: 'aabbb0',
        recipients: [{ participant_id: '01' }, { participant_id: '02' }],
        body: 'new body',
        message_id: '111',
        discussion_id: '112',
      });
    });
  });

  describe('participants', () => {
    it('uses the participants of up to date message when reply', () => {
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
      expect(calcSyncDraft(draft, message)).toEqual({
        recipients: [{ participant_id: '01' }, { participant_id: '02' }],
        parent_id: 'aabbb1',
        body: 'new body',
        message_id: '111',
        discussion_id: '112',
      });
    });
    it('uses the participants of up to date message when compose new but is actually a reply', () => {
      const draft = {
        ...draftBase,
        message_id: '111',
        participants: [
          { ...participantBase, participant_id: '01' },
          { ...participantBase, participant_id: '02' },
        ],
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
      expect(calcSyncDraft(draft, message)).toEqual({
        recipients: [{ participant_id: '01' }, { participant_id: '02' }],
        parent_id: 'aabbb0',
        body: 'new body',
        message_id: '111',
        discussion_id: '112',
      });
    });
    it('uses the participants of the draft when new', () => {
      const draft = {
        ...draftBase,
        message_id: '111',
        participants: [{ ...participantBase, participant_id: '03' }],
        body: 'new body',
        attachments: [{ file_name: 'foo.png', temp_id: 'aabbb111' }],
      };
      const message = {
        ...messageBase,
        participants: [
          { ...participantBase, participant_id: '01' },
          { ...participantBase, participant_id: '02' },
        ],
        body: 'old body',
        message_id: '111',
        discussion_id: '112',
      };
      expect(calcSyncDraft(draft, message)).toEqual({
        recipients: [{ participant_id: '03' }],
        body: 'new body',
        message_id: '111',
        discussion_id: '112',
      });
    });
  });
});
