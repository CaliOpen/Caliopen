import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Button from '../../../../components/Button';
import { FormGrid, FormRow, FormColumn, TextFieldGroup, FieldErrors } from '../../../../components/form';

function generateStateFromProps(props, prevState) {
  return {
    user: {
      ...prevState.settings,
      ...props.settings,
    },
  };
}

class ProfileForm extends Component {
  static propTypes = {
    errors: PropTypes.shape({}),
    onUpdateUser: PropTypes.func.isRequired,
    __: PropTypes.func.isRequired,
  };
  static defaultProps = {
    errors: {},
  };

  state = {
    user: {
      username: null,
      family_name: null,
      given_name: null,
      name: null,
      recovery_email: null,
      contact: {
        avatar: null,
      },
    },
  };

  componentWillMount() {
    this.setState(prevState => generateStateFromProps(this.props, prevState));
  }

  componentWillReceiveProps(newProps) {
    this.setState(prevState => generateStateFromProps(newProps, prevState));
  }


  handleSubmit = () => {
    const { settings } = this.state;
    this.props.onUpdateUser({ settings });
  }

  handleInputChange = (ev) => {
    const { name, value } = ev.target;

    this.setState(prevState => ({
      user: {
        ...prevState.settings,
        [name]: value,
      },
    }));
  }

  render() {
    const { errors, __ } = this.props;

    return (
      <FormGrid>
        <form method="post" name="profile_form" onSubmit={this.handleSubmit}>
          {errors.global && errors.global.length !== 0 && (
          <FormRow>
            <FormColumn bottomSpace>
              <FieldErrors errors={errors.global} />
            </FormColumn>
          </FormRow>
          )}
          <FormRow>
            <FormColumn size="shrink" bottomSpace >
              {
                // FIXME: avatar field should be a input type="file"
              }
              <TextFieldGroup
                name="avatar"
                value={this.state.user.avatar}
                onChange={this.handleInputChange}
                label={__('user.profile.form.avatar.label')}
              />
            </FormColumn>
            <FormColumn size="shrink" bottomSpace >
              <TextFieldGroup
                name="username"
                value={this.state.user.username}
                onChange={this.handleInputChange}
                label={__('user.profile.form.username.label')}
              />
            </FormColumn>
          </FormRow>
          <FormRow>
            <FormColumn size="shrink" bottomSpace>
              <TextFieldGroup
                name="given_name"
                value={this.state.user.given_name}
                onChange={this.handleInputChange}
                label={__('user.profile.form.given_name.label')}
              />
            </FormColumn>
            <FormColumn size="shrink" bottomSpace >
              <TextFieldGroup
                name="family_name"
                value={this.state.user.family_name}
                onChange={this.handleInputChange}
                label={__('user.profile.form.family_name.label')}
              />
            </FormColumn>
          </FormRow>
          <FormRow>
            <FormColumn size="shrink" bottomSpace >
              {
                // FIXME: can't get this.state.user.email
              }
              <TextFieldGroup
                name="email"
                value=""
                onChange={this.handleInputChange}
                label={__('user.profile.form.email.label')}
              />
            </FormColumn>
            <FormColumn size="shrink" bottomSpace >
              <TextFieldGroup
                name="recovery_email"
                value={this.state.user.recovery_email}
                onChange={this.handleInputChange}
                label={__('user.profile.form.recovery_email.label')}
              />
            </FormColumn>
          </FormRow>
          <FormRow>
            <FormColumn size="shrink" bottomSpace>
              <Button
                type="submit"
                shape="plain"
              >{__('user.action.update')}</Button>
            </FormColumn>
          </FormRow>
        </form>
      </FormGrid>
    );
  }
}

export default ProfileForm;
