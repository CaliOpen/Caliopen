import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Trans } from '@lingui/react';
import { PasswordStrength, Button, TextBlock } from '../../../../components';
import PasswordForm from '../PasswordForm';
import './style.scss';

function generateStateFromProps(props, prevState) {
  return {
    ...prevState,
    editMode: prevState.editMode && !props.updated,
  };
}

class PasswordDetails extends Component {
  static propTypes = {
    user: PropTypes.shape({}),
    onSubmit: PropTypes.func.isRequired,
  };

  static defaultProps = {
    user: undefined,
  };

  state = {
    editMode: false,
  };

  UNSAFE_componentWillMount() {
    this.setState((prevState) => generateStateFromProps(this.props, prevState));
  }

  UNSAFE_componentWillReceiveProps(newProps) {
    this.setState((prevState) => generateStateFromProps(newProps, prevState));
  }

  toggleEditMode = () => {
    this.setState((prevState) => ({ editMode: !prevState.editMode }));
  };

  render() {
    const { user, onSubmit } = this.props;
    // privacy_features.password_strength is a string
    const passwordStrengthNumber = user
      ? Number(user.privacy_features.password_strength)
      : 0;

    return (
      <div className="m-password-details">
        {!this.state.editMode && (
          <TextBlock className="m-password-details__title">
            <Trans id="password.details.password_strength.title">
              Password strength:
            </Trans>
          </TextBlock>
        )}
        {this.state.editMode ? (
          <div className="m-password-details__form">
            <PasswordForm onSubmit={onSubmit} onCancel={this.toggleEditMode} />
          </div>
        ) : (
          <PasswordStrength
            className="m-password-details__strength"
            strength={passwordStrengthNumber}
          />
        )}
        {!this.state.editMode && (
          <div className="m-password-details__action">
            <Button onClick={this.toggleEditMode}>
              <Trans id="password.details.action.change">Change</Trans>
            </Button>
          </div>
        )}
      </div>
    );
  }
}

export default PasswordDetails;
