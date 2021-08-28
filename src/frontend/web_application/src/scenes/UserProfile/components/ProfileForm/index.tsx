import * as React from 'react';
import { Field } from 'redux-form';
import { withI18nProps, withI18n } from '@lingui/react';
import {
  FieldErrors,
  TextFieldGroup as TextFieldGroupBase,
  FormGrid,
  FormRow,
  FormColumn,
} from 'src/components';
import renderReduxField from 'src/services/renderReduxField';

const TextFieldGroup = renderReduxField(TextFieldGroupBase);

interface Props extends withI18nProps {
  errors?: Record<string, string[]>;
  editMode?: boolean;
}

function ProfileForm({ errors, i18n, editMode = false }: Props) {
  return (
    <FormGrid className="s-profile-form">
      {errors && errors.global?.length !== 0 && (
        <FormRow>
          <FormColumn bottomSpace>
            <FieldErrors errors={errors.global} />
          </FormColumn>
        </FormRow>
      )}
      {/* disables avatar managment on alpha
          <FormRow>
            <FormColumn size="medium" bottomSpace >
              <Field
                component={TextFieldGroup}
                name="contact.avatar"
                label={__('user.profile.form.avatar.label')}
                disabled
              />
            </FormColumn>
          </FormRow>
        */}
      <FormRow>
        <FormColumn size="medium" bottomSpace>
          <Field
            component={TextFieldGroup}
            name="name"
            label={i18n._('user.profile.form.username.label', undefined, {
              defaults: 'Username',
            })}
            disabled
          />
        </FormColumn>
        <FormColumn size="medium" bottomSpace>
          <Field
            component={TextFieldGroup}
            name="recovery_email"
            label={i18n._('user.profile.form.recovery_email.label', undefined, {
              defaults: 'Recovery email',
            })}
            disabled
          />
        </FormColumn>
      </FormRow>
      <FormRow>
        <FormColumn size="medium" bottomSpace>
          <Field
            component={TextFieldGroup}
            name="contact.given_name"
            label={i18n._('user.profile.form.given_name.label', undefined, {
              defaults: 'Given name',
            })}
            disabled={!editMode}
          />
        </FormColumn>
        <FormColumn size="medium" bottomSpace>
          <Field
            component={TextFieldGroup}
            name="contact.family_name"
            label={i18n._('user.profile.form.family_name.label', undefined, {
              defaults: 'Family name',
            })}
            disabled={!editMode}
          />
        </FormColumn>
      </FormRow>
    </FormGrid>
  );
}

export default withI18n()(ProfileForm);
