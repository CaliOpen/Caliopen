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
          <Trans id="login.details.title">Login:</Trans>
        </TextBlock>
        <TextFieldGroup
          className="m-login-details__input"
          value={user && user.name}
          label={i18n._('login.details.label', null, { defaults: 'Login:' })}
          showLabelforSr
          disabled
        />
        {/* TODO: enable editing login info
          <div className="m-login-details__action">
          <Button onClick={this.toggleEditMode}>
            <Trans id="login.details.action.change">Change your login</Trans>
          </Button>
        </div>
      */}
      </div>
    );
  }
}

export default LoginDetails;
