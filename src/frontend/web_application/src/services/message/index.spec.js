import {
  isMessageFromUser,
  getRecipients,
  getRecipientsExceptUser,
  isUserRecipient,
} from './index';

describe('message services', () => {
  const user = {
    contact: {
      contact_id: 'john',
    },
  };

  describe('isMessageFromUser', () => {
    it('unknown contact', () => {
      const message = {
        participants: [
          {
            type: 'From',
          },
        ],
      };
      expect(isMessageFromUser(message, user)).toEqual(false);
    });

    it('known contact', () => {
      const message = {
        participants: [
          {
            type: 'From',
            contact_ids: ['whatever'],
          },
        ],
      };
      expect(isMessageFromUser(message, user)).toEqual(false);
    });

    it('is actually the user', () => {
      const message = {
        participants: [
          {
            type: 'From',
            contact_ids: ['john'],
          },
        ],
      };
      expect(isMessageFromUser(message, user)).toEqual(true);
    });
  });

  it('getRecipients', () => {
    const message = {
      participants: [
        {
          type: 'From',
        },
        {
          type: 'To',
        },
        {
          type: 'Cc',
        },
      ],
    };
    expect(getRecipients(message).length).toEqual(2);
  });

  describe('getRecipientsExceptUser', () => {
    it('user is a recipient', () => {
      const message = {
        participants: [
          {
            type: 'From',
          },
          {
            type: 'To',
            contact_ids: ['john'],
          },
          {
            type: 'Cc',
          },
        ],
      };
      expect(getRecipientsExceptUser(message, user).length).toEqual(1);
    });

    it('user is author', () => {
      const message = {
        participants: [
          {
            type: 'From',
            contact_ids: ['john'],
          },
          {
            type: 'To',
          },
          {
            type: 'Cc',
          },
        ],
      };
      expect(getRecipientsExceptUser(message, user).length).toEqual(2);
    });
  });

  describe('isUserRecipient', () => {
    it('user is a recipient', () => {
      const message = {
        participants: [
          {
            type: 'From',
          },
          {
            type: 'To',
            contact_ids: ['john'],
          },
          {
            type: 'Cc',
          },
        ],
      };
      expect(isUserRecipient(message, user)).toEqual(true);
    });

    it('user is author', () => {
      const message = {
        participants: [
          {
            type: 'From',
            contact_ids: ['john'],
          },
          {
            type: 'To',
          },
          {
            type: 'Cc',
          },
        ],
      };
      expect(isUserRecipient(message, user)).toEqual(false);
    });
  });
});
