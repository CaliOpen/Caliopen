import { changeAuthorInParticipants } from './changeAuthorInParticipants';

describe('modules draftMessage - service - changeAuthorInParticipants', () => {
  const user = {
    contact: { contact_id: 'user-contact' },
  };

  describe('identity', () => {
    it('has already identity as author', () => {
      const identity = {
        identifier: 'leela@planet-express.tld',
        protocol: 'imap',
      };
      const participants = [
        {
          address: 'fry@planet-express.tld',
          contact_ids: ['user-contact'],
          protocol: 'email',
          type: 'To',
        },
        {
          address: 'zoidberg@planet-express.tld',
          contact_ids: ['t2'],
          protocol: 'email',
          type: 'To',
        },
        {
          address: 'leela@planet-express.tld',
          protocol: 'email',
          type: 'From',
        },
      ];
      expect(
        changeAuthorInParticipants({ participants, user, identity })
      ).toEqual(participants);
    });

    it('changes the author using the identity (an other recipient is associated to the user)', () => {
      const identity = {
        identifier: 'leela@planet-express.tld',
        protocol: 'imap',
      };
      const participants = [
        {
          address: 'fry@planet-express.tld',
          contact_ids: ['user-contact'],
          protocol: 'email',
          type: 'From',
        },
        {
          address: 'zoidberg@planet-express.tld',
          contact_ids: ['t2'],
          protocol: 'email',
          type: 'To',
        },
        { address: 'leela@planet-express.tld', protocol: 'email', type: 'To' },
      ];
      expect(
        changeAuthorInParticipants({ participants, user, identity })
      ).toEqual([
        { ...participants[0], type: 'To' },
        participants[1],
        { ...participants[2], type: 'From' },
      ]);
    });
  });

  describe('user', () => {
    it('has already user as author', () => {
      const identity = undefined;

      const participants = [
        {
          address: 'fry@planet-express.tld',
          contact_ids: ['user-contact'],
          protocol: 'email',
          type: 'From',
        },
        {
          address: 'zoidberg@planet-express.tld',
          contact_ids: ['t2'],
          protocol: 'email',
          type: 'To',
        },
        { address: 'leela@planet-express.tld', protocol: 'email', type: 'To' },
      ];
      expect(
        changeAuthorInParticipants({ participants, user, identity })
      ).toEqual(participants);
    });

    it('changes the author using the user', () => {
      const identity = undefined;

      const participants = [
        {
          address: 'zoidberg@planet-express.tld',
          contact_ids: ['t2'],
          protocol: 'email',
          type: 'From',
        },
        {
          address: 'fry@planet-express.tld',
          contact_ids: ['user-contact'],
          protocol: 'email',
          type: 'To',
        },
        { address: 'leela@planet-express.tld', protocol: 'email', type: 'To' },
      ];
      expect(
        changeAuthorInParticipants({ participants, user, identity })
      ).toEqual([
        { ...participants[0], type: 'To' },
        { ...participants[1], type: 'From' },
        participants[2],
      ]);
    });
  });

  describe('edge cases', () => {
    it('has no identity anymore and no associated user', () => {
      const identity = {
        identifier: 'whatever@example.tld',
        protocol: 'imap',
      };

      const participants = [
        { address: 'fry@old-address.example', protocol: 'email', type: 'To' },
        {
          address: 'zoidberg@planet-express.tld',
          contact_ids: ['t2'],
          protocol: 'email',
          type: 'From',
        },
        { address: 'leela@planet-express.tld', protocol: 'email', type: 'To' },
      ];
      expect(
        changeAuthorInParticipants({ participants, user, identity })
      ).toEqual([
        participants[0],
        { ...participants[1], type: 'To' },
        participants[2],
      ]);
    });

    it('has not participants', () => {
      const identity = undefined;

      const participants = undefined;
      expect(
        changeAuthorInParticipants({ participants, user, identity })
      ).toEqual(participants);
    });
  });
});
