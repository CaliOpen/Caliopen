import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Trans, withI18n } from '@lingui/react';
import classNames from 'classnames';
import {
  FieldErrors,
  TextFieldGroup,
  Button,
  FormGrid,
  FormRow,
  FormColumn,
} from '../../../../components';
import { setPassphrase } from '../../../../store/modules/encryption';

import './style.scss';

const mapDispatchToProps = (dispatch, ownProps) => ({
  onSubmit: (passphrase) =>
    dispatch(setPassphrase({ passphrase, fingerprint: ownProps.fingerprint })),
});

const mapStateToProps = (state, ownProps) => ({
  error: state.encryption.privateKeysByFingerprint[ownProps.fingerprint].error,
});

@withI18n()
@connect(mapStateToProps, mapDispatchToProps)
class AskPassphraseForm extends Component {
  static propTypes = {
    numberMessages: PropTypes.number.isRequired,
    fingerprint: PropTypes.string.isRequired,
    onSubmit: PropTypes.func.isRequired,
    className: PropTypes.string,
    error: PropTypes.string,
    i18n: PropTypes.shape({ _: PropTypes.func }).isRequired,
  };

  static defaultProps = {
    className: '',
    error: undefined,
  };

  state = {
    passphrase: '',
  };

  getErrorId = (message) => {
    const { i18n } = this.props;

    switch (message) {
      case 'Incorrect key passphrase':
        return i18n._(
          'encryption.ask-passphrase.error.invalid-passphrase',
          null,
          'Invalid passphrase'
        );
      default:
        return i18n._(
          'encrytion.ask-passphrase.error.unknown',
          null,
          'Unknown error'
        );
    }
  };

  handleChange = (event) => this.setState({ passphrase: event.target.value });

  handleSubmit = (event) => {
    const { onSubmit } = this.props;

    onSubmit(this.state.passphrase);
    event.preventDefault();
  };

  render() {
    const { error, className, fingerprint, numberMessages } = this.props;

    return (
      <FormGrid className={classNames(className, 'm-ask-passphrase')}>
        <form onSubmit={this.handleSubmit}>
          <Trans
            id="encryption.ask-passphrase.explain"
            values={{ fingerprint: fingerprint.toUpperCase(), numberMessages }}
          >
            Please enter passphrase for key {`${fingerprint}`} to unlock{' '}
            {`${numberMessages}`} messages.
          </Trans>
          {error && (
            <FormRow>
              <FormColumn>
                <FieldErrors errors={[this.getErrorId(error)]} />
              </FormColumn>
            </FormRow>
          )}
          <FormRow>
            <FormColumn>
              {
                // this input is intended to enable multiple key/passphrase
                // storage in password manager.
              }
              <input
                type="text"
                className="m-ask-passphrase--input-fingerprint"
                name={`login-${fingerprint}`}
                value={fingerprint.toUpperCase()}
                readOnly
              />
              <TextFieldGroup
                type="password"
                name={`passphrase-${fingerprint}`}
                value={this.state.passphrase}
                onChange={this.handleChange}
                autocomplete="current-password"
              />
            </FormColumn>
            <FormColumn>
              <Button type="submit" shape="plain">
                <Trans id="encryption.ask-passphrase.validate">Validate</Trans>
              </Button>
            </FormColumn>
          </FormRow>
        </form>
      </FormGrid>
    );
  }
}

export default AskPassphraseForm;
