import { findUserParticipant } from './findUserParticipant';

describe('message module - services - findUserParticipant', () => {
  const user = {
    contact: {
      contact_id: 'abc',
    },
  };

  it('has no participants', async () => {
    expect(findUserParticipant({ user })).toBeUndefined();
  });

  it('has not the participant', async () => {
    const participants = [{ address: 'foo@bar.tld' }];
    expect(findUserParticipant({ participants, user })).toBeUndefined();
  });

  it('has the participant', async () => {
    const participants = [
      { address: 'foo@bar.tld' },
      { address: 'abc@bar.tld', contact_ids: ['abc'] },
    ];
    expect(findUserParticipant({ participants, user })).toEqual(
      participants[1]
    );
  });
});
