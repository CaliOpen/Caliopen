import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Button from '../../../../components/Button';
import { PasswordStrength } from '../../../../components/form';
import PasswordForm from '../PasswordForm';
import TextBlock from '../../../../components/TextBlock';
import './style.scss';

function generateStateFromProps(props, prevState) {
  return {
    ...prevState,
    editMode: prevState.editMode && !props.updated,
  };
}

class PasswordDetails extends Component {
  static propTypes = {
    __: PropTypes.func.isRequired,
    user: PropTypes.shape({}).isRequired,
    onSubmit: PropTypes.func.isRequired,
  };

  static defaultProps = {
    errors: [],
  }

  state = {
    editMode: false,
  }

  componentWillMount() {
    this.setState(prevState => generateStateFromProps(this.props, prevState));
  }

  componentWillReceiveProps(newProps) {
    this.setState(prevState => generateStateFromProps(newProps, prevState));
  }

  toggleEditMode = () => {
    this.setState(prevState => ({ editMode: !prevState.editMode }));
  }

  render() {
    const { __, user, onSubmit } = this.props;
    // privacy_features.password_strength is a string
    const passwordStrengthNumber = user ? Number(user.privacy_features.password_strength) : 0;

    return (
      <div className="m-password-details">
        {!this.state.editMode &&
          <TextBlock className="m-password-details__title">
            {__('password.details.password_strength.title')}
          </TextBlock>
        }
        {this.state.editMode ?
          <div className="m-password-details__form">
            <PasswordForm
              __={__}
              onSubmit={onSubmit}
              onCancel={this.toggleEditMode}
            />
          </div>
        :
          <PasswordStrength
            className="m-password-details__strength"
            strength={passwordStrengthNumber}
          />
        }
        {!this.state.editMode &&
          <div className="m-password-details__action">
            <Button onClick={this.toggleEditMode}>{__('password.details.action.change')}</Button>
          </div>
        }
      </div>
    );
  }
}

export default PasswordDetails;
