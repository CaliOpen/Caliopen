import { encryptMessage, isMessageEncrypted } from './index';

jest.mock('openpgp', () => ({
  key: {
    readArmored: async (a) => ({ keys: [a] }),
  },
  message: {
    fromText: (a) => a,
  },
  encrypt: async (options) => ({
    data: options.publicKeys.join(', '),
  }),
}));

describe('modules draftMessage -- service -- encryption', () => {
  it('Encrypt a simple draft', async () => {
    const publicKeys = [
      { emails: 'jaune@john.com', key: 'Hello' },
      { emails: 'boo@far.com', key: 'encryption.' },
    ];
    const draft = { body: 'Thou shalt not read my mails !' };

    expect(await encryptMessage(draft, publicKeys)).toEqual({
      body: 'Hello, encryption.',
      // XXX: thoses privacy_features are set in encryption middleware. I'm not sure who's
      // responsible of this
      // privacy_features: {
      //   message_encrypted: 'True',
      //   message_encryption_method: 'pgp',
      // },
    });
  });

  it('Properly detects non-encryption in privacy_features', () => {
    const message = {
      body: 'Empty body',
      privacy_features: {
        message_encrypted: 'False',
        message_encryption_method: 'pgp',
      },
    };

    const message2 = {
      body: 'Empty body',
      privacy_features: {
        message_encrypted: 'True',
        message_encryption_method: 'aes',
      },
    };

    expect(isMessageEncrypted(message)).toBeFalsy();
    expect(isMessageEncrypted(message2)).toBeFalsy();
  });

  it('Properly detects encryption in privacy_features', () => {
    const message = {
      body: 'Void body',
      privacy_features: {
        message_encrypted: 'True',
        message_encryption_method: 'pgp',
      },
    };

    expect(isMessageEncrypted(message)).toBeTruthy();
  });
});
