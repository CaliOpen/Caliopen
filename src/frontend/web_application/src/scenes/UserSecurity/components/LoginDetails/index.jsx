import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withI18n, Trans } from '@lingui/react';
// import { Button } from '../../../../components/';
import { TextBlock, TextFieldGroup } from '../../../../components';
import './style.scss';

@withI18n()
class LoginDetails extends Component {
  static propTypes = {
    i18n: PropTypes.shape({ _: PropTypes.func }).isRequired,
    user: PropTypes.shape({}).isRequired,
  };

  // state = {
  //   editMode: false,
  // }
  //
  // toggleEditMode = () => {
  //   this.setState(prevState => ({ editMode: !prevState.editMode }));
  // }

  render() {
    const { i18n, user } = this.props;

    return (
      <div className="m-login-details">
        <TextBlock className="m-login-details__title">
          <Trans id="login.details.title" message="Login:" />
        </TextBlock>
        <TextFieldGroup
          className="m-login-details__input"
          inputProps={{
            value: user && user.name,
            disabled: true,
          }}
          label={i18n._(/* i18n */ 'login.details.label', null, {
            message: 'Login:',
          })}
          showLabelforSr
        />
        {/* TODO: enable editing login info
          <div className="m-login-details__action">
          <Button onClick={this.toggleEditMode}>
            <Trans id="login.details.action.change" message="Change your login" />
          </Button>
        </div>
      */}
      </div>
    );
  }
}

export default LoginDetails;
