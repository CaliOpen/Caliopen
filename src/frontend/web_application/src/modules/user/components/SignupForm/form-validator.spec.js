import validator from './form-validator';

jest.mock(
  '../../../../services/username-utils/username-availability',
  () => () => Promise.resolve(true)
);

describe('scene Signup form-validator', () => {
  const i18n = { _: (id) => id };
  it('validates', async () => {
    const isValid = await validator.validate(
      {
        username: 'bender',
        password: '101121',
        tos: true,
        privacy: true,
        recovery_email: 'bender@planetexpress.tld',
      },
      i18n,
      'full'
    );
    expect(isValid).toBe(true);
  });
  it('render errors for form', async () => {
    try {
      const isValid = await validator.validate(
        {
          password: '',
          // tos: false,
          privacy: false,
          recovery_email: 'bender',
        },
        i18n,
        'full'
      );
      expect(isValid).not.toBe(true);
    } catch (e) {
      expect(e).toEqual({
        username: ['signup.feedback.required_username'],
        // tos: ['signup.feedback.required_tos'],
        privacy: ['signup.feedback.required_privacy'],
        password: ['signup.feedback.required_password'],
        recovery_email: ['signup.feedback.invalid_recovery_email'],
      });
    }
  });
});
