import Schema from 'async-validator';
import usernameDescriptor, {
  ERR_MIN_MAX,
  ERR_INVALID_CHARACTER,
  ERR_DOTS,
  ERR_DOUBLE_DOTS,
} from '../../../../services/username-utils/username-validity';
import usernameAvailability from '../../../../services/username-utils/username-availability';

export const ERR_REQUIRED_TOS = 'ERR_REQUIRED_TOS';
export const ERR_REQUIRED_PRIVACY = 'ERR_REQUIRED_PRIVACY';
export const ERR_INVALID_GLOBAL = 'ERR_INVALID_GLOBAL';
export const ERR_REQUIRED_USERNAME = 'ERR_REQUIRED_USERNAME';
export const ERR_REQUIRED_PASSWORD = 'ERR_REQUIRED_PASSWORD';
export const ERR_UNAVAILABLE_USERNAME = 'ERR_UNAVAILABLE_USERNAME';
export const ERR_INVALID_RECOVERY_EMAIL = 'ERR_INVALID_RECOVERY_EMAIL';
export const ERR_REQUIRED_RECOVERY_EMAIL = 'ERR_REQUIRED_RECOVERY_EMAIL';
export const ERR_UNABLE_TO_SIGNUP = 'ERR_UNABLE_TO_SIGNUP';

export const getLocalizedErrors = (i18n) => ({
  [ERR_DOTS]: i18n._('signup.feedback.username_starting_ending_dot', null, {
    defaults: 'The username cannot start or end with a dot (.)',
  }),
  [ERR_MIN_MAX]: i18n._('signup.feedback.username_length', null, {
    defaults: 'The length of the username must be be between 3 and 42',
  }),
  [ERR_DOUBLE_DOTS]: i18n._('signup.feedback.username_double_dots', null, {
    defaults: 'The username cannot contain two dots (.) next to the other',
  }),
  [ERR_REQUIRED_PRIVACY]: i18n._('signup.feedback.required_privacy', null, {
    defaults: 'We need your privacy policy agreement',
  }),
  [ERR_REQUIRED_TOS]: i18n._('signup.feedback.required_tos', null, {
    defaults: 'We need your terms and conditions agreement',
  }),
  [ERR_INVALID_GLOBAL]: i18n._('signup.feedback.invalid', null, {
    defaults: 'Credentials are invalid',
  }),
  [ERR_REQUIRED_USERNAME]: i18n._('signup.feedback.required_username', null, {
    defaults: 'A username is required',
  }),
  [ERR_INVALID_CHARACTER]: i18n._(
    'signup.feedback.username_invalid_characters',
    { 0: '"@`:;<>[]\\' },
    {
      defaults:
        'The username cannot contain some special characters like {0} and space',
    }
  ),
  [ERR_REQUIRED_PASSWORD]: i18n._('signup.feedback.required_password', null, {
    defaults: 'A password is required',
  }),
  [ERR_UNAVAILABLE_USERNAME]: i18n._(
    'signup.feedback.unavailable_username',
    null,
    { defaults: 'We are sorry, this username is not available' }
  ),
  [ERR_INVALID_RECOVERY_EMAIL]: i18n._(
    'signup.feedback.invalid_recovery_email',
    null,
    { defaults: 'The email should be valid' }
  ),
  [ERR_REQUIRED_RECOVERY_EMAIL]: i18n._(
    'signup.feedback.required_recovery_email',
    null,
    { defaults: 'A backup email is required' }
  ),
  [ERR_UNABLE_TO_SIGNUP]: i18n._('signup.feedback.unable_to_signup', null, {
    defaults: 'Unable to signup. Please retry or contact an administrator.',
  }),
});

const descriptor = {
  username: [
    ...usernameDescriptor.username,
    { type: 'string', required: true, message: ERR_REQUIRED_USERNAME },
  ],
  // Alpha: hide TOS checkbox
  // tos: [
  //   (rule, value, callback) => {
  //     if (value !== true) {
  //       return callback({ message: ERR_REQUIRED_TOS });
  //     }
  //
  //     return callback();
  //   },
  // ],
  privacy: [
    (rule, value, callback) => {
      if (value !== true) {
        return callback({ message: ERR_REQUIRED_PRIVACY });
      }

      return callback();
    },
  ],
  recovery_email: [
    { type: 'string', required: true, message: ERR_REQUIRED_RECOVERY_EMAIL },
    { type: 'email', message: ERR_INVALID_RECOVERY_EMAIL },
  ],
  password: [
    { type: 'string', required: true, message: ERR_REQUIRED_PASSWORD },
  ],
};

const usernameAvailabilityDescriptor = {
  username: [
    ...descriptor.username,
    (rule, value, callback) => {
      if (!value) {
        callback();

        return;
      }
      usernameAvailability(value).then((result) => {
        if (result === true) {
          return callback();
        }

        return callback({ message: ERR_UNAVAILABLE_USERNAME });
      });
    },
  ],
};

const makeDescriptor = (type) => {
  switch (type) {
    case 'full':
      return {
        ...descriptor,
        ...usernameAvailabilityDescriptor,
      };
    case 'usernameAvailability':
      return usernameAvailabilityDescriptor;
    default:
    case 'username':
      return usernameDescriptor;
  }
};

const extractErrors = (fieldsErrors, i18n) => {
  const localizedErrors = getLocalizedErrors(i18n);

  return Object.keys(fieldsErrors).reduce(
    (prev, fieldname) => ({
      ...prev,
      [fieldname]: fieldsErrors[fieldname].map(
        (error) => localizedErrors[error.message] || error.message
      ),
    }),
    {}
  );
};
const validate = (formValues, i18n, descriptorType = false) =>
  new Promise((resolve, reject) => {
    const validator = new Schema(makeDescriptor(descriptorType));
    validator.validate(formValues, (errors, fields) => {
      if (errors) {
        return reject(extractErrors(fields, i18n));
      }

      return resolve(true);
    });
  });

export default { validate };
