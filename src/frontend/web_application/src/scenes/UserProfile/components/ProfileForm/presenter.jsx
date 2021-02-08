import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Field } from 'redux-form';
import {
  FieldErrors,
  TextFieldGroup as TextFieldGroupBase,
  FormGrid,
  FormRow,
  FormColumn,
} from '../../../../components';
import renderReduxField from '../../../../services/renderReduxField';

const TextFieldGroup = renderReduxField(TextFieldGroupBase);

class ProfileForm extends PureComponent {
  static propTypes = {
    errors: PropTypes.shape({}),
    editMode: PropTypes.bool.isRequired,
    i18n: PropTypes.shape({ _: PropTypes.func }).isRequired,
  };

  static defaultProps = {
    errors: {},
  };

  render() {
    const { errors, editMode, i18n } = this.props;

    return (
      <FormGrid className="s-profile-form">
        {errors.global && errors.global.length !== 0 && (
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
              label={i18n._('user.profile.form.username.label', null, {
                defaults: 'Username',
              })}
              disabled
            />
          </FormColumn>
          <FormColumn size="medium" bottomSpace>
            <Field
              component={TextFieldGroup}
              name="recovery_email"
              label={i18n._('user.profile.form.recovery_email.label', null, {
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
              label={i18n._('user.profile.form.given_name.label', null, {
                defaults: 'Given name',
              })}
              disabled={!editMode}
            />
          </FormColumn>
          <FormColumn size="medium" bottomSpace>
            <Field
              component={TextFieldGroup}
              name="contact.family_name"
              label={i18n._('user.profile.form.family_name.label', null, {
                defaults: 'Family name',
              })}
              disabled={!editMode}
            />
          </FormColumn>
        </FormRow>
      </FormGrid>
    );
  }
}

export default ProfileForm;
