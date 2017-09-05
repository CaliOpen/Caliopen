import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FormGrid, FormRow, FormColumn, TextFieldGroup, FieldErrors } from '../form';
import Button from '../Button';
import Section from '../Section';
import Link from '../Link';

import './style.scss';

function generateStateFromProps(props) {
  return {
    ...props.formValues,
  };
}

class SigninForm extends Component {
  static propTypes = {
    errors: PropTypes.shape({}),
    form: PropTypes.shape({}),
    onSubmit: PropTypes.func.isRequired,
    __: PropTypes.func.isRequired,
  };

  static defaultProps = {
    errors: {},
    form: {},
  };

  state = {
    formValues: {
      username: '',
      password: '',
    },
  };

  componentWillMount() {
    this.setState(generateStateFromProps(this.props));
  }

  componentWillReceiveProps(newProps) {
    this.setState(generateStateFromProps(newProps));
  }

  handleInputChange = (event) => {
    const { name, value } = event.target;
    this.setState(prevState => ({
      formValues: {
        ...prevState.formValues,
        [name]: value,
      },
    }));
  }

  handleSubmit = (ev) => {
    ev.preventDefault();
    const { formValues } = this.state;
    this.props.onSubmit({ formValues });
  }

  render() {
    const { errors = {}, form, __ } = this.props;

    return (
      <Section className="s-signin" title={__('signin.title')}>
        <FormGrid className="s-signin__form">
          <form method="post" {...form}>
            { errors.global && (
              <FormColumn bottomSpace>
                <FormRow>
                  <FieldErrors errors={errors.global} />
                </FormRow>
              </FormColumn>
            )}
            <FormRow>
              <FormColumn bottomSpace>
                <TextFieldGroup
                  id="signin_username"
                  label={__('signin.form.username.label')}
                  placeholder={__('signin.form.username.placeholder')}
                  name="username"
                  value={this.state.username}
                  errors={errors.username}
                  onChange={this.handleInputChange}
                  showLabelforSr
                />
              </FormColumn>
              <FormColumn bottomSpace>
                <TextFieldGroup
                  id="signin_password"
                  label={__('signin.form.password.label')}
                  placeholder={__('signin.form.password.placeholder')}
                  name="password"
                  type="password"
                  value={this.state.password}
                  errors={errors.password}
                  onChange={this.handleInputChange}
                  showLabelforSr
                />
              </FormColumn>
            </FormRow>
            <FormRow>
              <FormColumn className="s-signin__action" bottomSpace>
                <Button
                  type="submit"
                  onClick={this.handleSubmit}
                  display="expanded"
                  shape="plain"
                >{__('signin.action.login')}</Button>
              </FormColumn>
            </FormRow>
            <FormRow>
              <FormColumn>
                <Link to="/auth/signup">{__('signin.create_an_account')}</Link>
              </FormColumn>
            </FormRow>
          </form>
        </FormGrid>
      </Section>
    );
  }
}

export default SigninForm;
