import Schema from 'async-validator';
import usernameDescriptor, { ERR_MIN_MAX, ERR_INVALID_CHARACTER, ERR_DOTS, ERR_DOUBLE_DOTS } from '../../services/username-utils/username-validity';
import usernameAvailability from '../../services/username-utils/username-availability';

const ERR_REQUIRED_TOS = 'ERR_REQUIRED_TOS';
const ERR_REQUIRED_PRIVACY = 'ERR_REQUIRED_PRIVACY';
const ERR_INVALID_GLOBAL = 'ERR_INVALID_GLOBAL';
const ERR_REQUIRED_USERNAME = 'ERR_REQUIRED_USERNAME';
const ERR_REQUIRED_PASSWORD = 'ERR_REQUIRED_PASSWORD';
const ERR_UNAVAILABLE_USERNAME = 'ERR_UNAVAILABLE_USERNAME';
const ERR_INVALID_RECOVERY_EMAIL = 'ERR_INVALID_RECOVERY_EMAIL';
const ERR_REQUIRED_RECOVERY_EMAIL = 'ERR_REQUIRED_RECOVERY_EMAIL';

export const getLocalizedErrors = __ => ({
  [ERR_DOTS]: __('signup.feedback.username_starting_ending_dot'),
  [ERR_MIN_MAX]: __('signup.feedback.username_length'),
  [ERR_DOUBLE_DOTS]: __('signup.feedback.username_double_dots'),
  [ERR_REQUIRED_PRIVACY]: __('signup.feedback.required_privacy'),
  [ERR_REQUIRED_TOS]: __('signup.feedback.required_tos'),
  [ERR_INVALID_GLOBAL]: __('signup.feedback.invalid'),
  [ERR_REQUIRED_USERNAME]: __('signup.feedback.required_username'),
  [ERR_INVALID_CHARACTER]: __('signup.feedback.username_invalid_characters'),
  [ERR_REQUIRED_PASSWORD]: __('signup.feedback.required_password'),
  [ERR_UNAVAILABLE_USERNAME]: __('signup.feedback.unavailable_username'),
  [ERR_INVALID_RECOVERY_EMAIL]: __('signup.feedback.invalid_recovery_email'),
  [ERR_REQUIRED_RECOVERY_EMAIL]: __('signup.feedback.required_recovery_email'),
});

const descriptor = {
  ...usernameDescriptor,
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

const makeDescriptor = (type) => {
  switch (type) {
    case 'full':
      return descriptor;
    case 'usernameAvailability':
      return {
        username: [
          ...usernameDescriptor.username,
          (rule, value, callback) => {
            usernameAvailability(value).then((result) => {
              if (result === true) {
                return callback();
              }

              return callback({ message: ERR_UNAVAILABLE_USERNAME });
            });
          },
        ],
      };
    default:
    case 'username':
      return usernameDescriptor;
  }
};

const extractErrors = (fieldsErrors, __) => {
  const localizedErrors = getLocalizedErrors(__);

  return Object.keys(fieldsErrors).reduce((prev, fieldname) => ({
    ...prev,
    [fieldname]: fieldsErrors[fieldname]
      .map(error => localizedErrors[error.message] || error.message),
  }), {});
};
const validate = (formValues, __, descriptorType = false) => new Promise((resolve, reject) => {
  const validator = new Schema(makeDescriptor(descriptorType));
  validator.validate(formValues, (errors, fields) => {
    if (errors) {
      return reject(extractErrors(fields, __));
    }

    return resolve(true);
  });
});

export default { validate };
