import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Trans } from '@lingui/react';
import { Icon, Button } from '../../../../components';
import {
  getPrimaryKeysByFingerprint,
  saveKey,
  deleteKey,
} from '../../../../services/openpgp-keychain-repository';
import {
  generateKey,
  getPublicKeyFromPrivateKey,
} from '../../../../services/encryption';
import OpenPGPKey from '../OpenPGPKey';
import OpenPGPKeyForm from '../OpenPGPKeyForm';
import './style.scss';

class OpenPGPKeysDetails extends Component {
  static propTypes = {
    user: PropTypes.shape({}).isRequired,
    isLoading: PropTypes.bool,
    saveUserPublicKey: PropTypes.func.isRequired,
  };

  static defaultProps = {
    isLoading: false,
  };

  state = {
    importForm: { errors: {} },
    generateForm: { errors: {} },
    editMode: false,
    keys: undefined,
    isFormLoading: false,
  };

  componentDidMount() {
    this.updateKeyState({
      generateForm: {
        email: this.getUserEmails(),
      },
    });
  }

  getPrivateKeys = () => Object.values(this.state.keys || {});

  getUserEmails = () => {
    const {
      user: { contact, title },
    } = this.props;

    if (contact) {
      return contact.emails.map(({ address }) => ({
        name: title,
        email: address,
      }));
    }

    return null;
  };

  updateKeyState = (newState) =>
    getPrimaryKeysByFingerprint().then((keys) =>
      this.setState((prevState) => ({
        ...prevState,
        ...newState,
        keys,
      }))
    );

  handleClickEditMode = () => {
    this.setState((prevState) => ({
      editMode: !prevState.editMode,
    }));
  };

  importKeys = async () => {
    const { saveUserPublicKey, user } = this.props;
    const { privateKeyArmored, passphrase } = this.state.importForm;

    this.setState({ isFormLoading: true });
    try {
      const publicKeyArmored = await getPublicKeyFromPrivateKey(
        privateKeyArmored,
        passphrase
      );
      const error = await saveKey(publicKeyArmored, privateKeyArmored);
      const newState = error
        ? {
            isFormLoading: false,
            importForm: {
              privateKeyArmored,
              passphrase,
              errors: { global: [error] },
            },
          }
        : {
            isFormLoading: false,
            importForm: {
              errors: {},
              privateKeyArmored: '',
              passphrase: '',
            },
          };

      if (!error) {
        saveUserPublicKey(publicKeyArmored, user);
      }

      this.updateKeyState(newState);
    } catch (e) {
      this.updateKeyState({
        isFormLoading: false,
        importForm: {
          privateKeyArmored,
          passphrase,
          errors: { global: [e.message] },
        },
      });
    }
  };

  handleDeleteKey = async ({ fingerprint }) => {
    await deleteKey(fingerprint);

    this.updateKeyState({});
  };

  handleImportFormChange = (newValue) => {
    this.setState((prevState) => ({
      importForm: {
        ...prevState.importForm,
        ...newValue,
      },
    }));
  };

  handleGenerateFormChange = (newValue) => {
    this.setState((prevState) => ({
      generateForm: {
        ...prevState.generateForm,
        ...newValue,
      },
    }));
  };

  generateAndSaveKeys = async () => {
    const { saveUserPublicKey, user } = this.props;

    this.setState({ isFormLoading: true });
    const options = {
      passphrase: this.state.generateForm.passphrase,
      userIds: this.state.generateForm.email,
      numbits: 4096,
    };

    const { privateKeyArmored, publicKeyArmored } = await generateKey(options);
    const error = await saveKey(publicKeyArmored, privateKeyArmored);
    const newState = error ? {} : { isFormLoading: false, importForm: {} };

    if (!error) {
      saveUserPublicKey(publicKeyArmored, user);
    }

    this.updateKeyState(newState);

    return error;
  };

  renderPrivateKey = (keyPair, key) => (
    <OpenPGPKey
      key={key}
      className="m-account-openpgp__keys"
      publicKeyArmored={keyPair.publicKeyArmored}
      privateKeyArmored={keyPair.privateKeyArmored}
      editMode={this.state.editMode}
      onDeleteKey={this.handleDeleteKey}
    >
      <Icon type="key" />
    </OpenPGPKey>
  );

  render() {
    const { isLoading, user } = this.props;

    const activeButtonProp = this.state.editMode ? { color: 'active' } : {};

    return (
      <div className="m-account-openpgp">
        {this.getPrivateKeys().map(this.renderPrivateKey)}
        {this.state.editMode ? (
          <OpenPGPKeyForm
            className="m-account-openpgp__form"
            emails={user.contact.emails}
            onImport={this.importKeys}
            onGenerate={this.generateAndSaveKeys}
            onImportFormChange={this.handleImportFormChange}
            onGenerateFromChange={this.handleGenerateFormChange}
            importForm={this.state.importForm}
            generateForm={this.state.generateForm}
            isLoading={isLoading || this.state.isFormLoading}
            cancel={this.handleClickEditMode}
          />
        ) : (
          <Button
            {...activeButtonProp}
            onClick={this.handleClickEditMode}
            shape="plain"
            icon="plus"
          >
            <Trans id="user.openpgp.action.edit-keys">Edit and add keys</Trans>
          </Button>
        )}
      </div>
    );
  }
}

export default OpenPGPKeysDetails;
