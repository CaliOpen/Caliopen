import * as React from 'react';
import { Field } from 'formik';
import { withI18nProps, withI18n } from '@lingui/react';
import { FieldErrors, FormikTextFieldGroup } from 'src/components';
import './style.scss';

interface Props extends withI18nProps {
  errors?: Record<string, string[]>;
  editMode?: boolean;
}

function ProfileForm({ errors, i18n, editMode = false }: Props) {
  return (
    <div className="s-profile-form">
      {errors && errors.global?.length !== 0 && (
        <FieldErrors errors={errors.global} />
      )}
      {/* disables avatar managment on alpha
              <Field
                component={TextFieldGroup}
                name="contact.avatar"
                label={__('user.profile.form.avatar.label')}
                disabled
              />
        */}
      <Field
        id="profile_form.name"
        component={FormikTextFieldGroup}
        name="name"
        label={i18n._(
          /* i18n */ 'user.profile.form.username.label',
          undefined,
          {
            message: 'Username',
          }
        )}
        inputProps={{
          disabled: true,
        }}
      />
      <Field
        id="profile_form.recovery_email"
        component={FormikTextFieldGroup}
        name="recovery_email"
        label={i18n._(
          /* i18n */ 'user.profile.form.recovery_email.label',
          undefined,
          {
            message: 'Recovery email',
          }
        )}
        inputProps={{
          disabled: true,
        }}
      />
      <Field
        id="profile_form.given_name"
        component={FormikTextFieldGroup}
        name="contact.given_name"
        label={i18n._(
          /* i18n */ 'user.profile.form.given_name.label',
          undefined,
          {
            message: 'Given name',
          }
        )}
        inputProps={{
          disabled: !editMode,
        }}
      />
      <Field
        id="profile_form.famaily_name"
        component={FormikTextFieldGroup}
        name="contact.family_name"
        label={i18n._(
          /* i18n */ 'user.profile.form.family_name.label',
          undefined,
          {
            message: 'Family name',
          }
        )}
        inputProps={{
          disabled: !editMode,
        }}
      />
    </div>
  );
}

export default withI18n()(ProfileForm);
