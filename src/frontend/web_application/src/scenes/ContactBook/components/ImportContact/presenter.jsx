import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withI18n } from '@lingui/react';
import { withNotification } from '../../../../modules/userNotify';
import getClient from '../../../../services/api-client';
import ImportContactForm from '../ImportContactForm';
import UploadFileAsFormField from '../../../../modules/file/services/uploadFileAsFormField';

@withI18n()
@withNotification()
class ImportContact extends Component {
  static propTypes = {
    i18n: PropTypes.shape({ _: PropTypes.func }).isRequired,
    onCancel: PropTypes.func,
    onUploadSuccess: PropTypes.func,
    notifySuccess: PropTypes.func.isRequired,
    notifyError: PropTypes.func.isRequired,
  };

  static defaultProps = {
    onCancel: null,
    onUploadSuccess: () => {
      // noop
    },
  };

  state = {
    errors: {},
    hasImported: false,
    isLoading: false,
  };

  handleImportContact = ({ file }) => {
    const data = new UploadFileAsFormField(file, 'file');

    this.setState({ isLoading: true });
    getClient()
      .post('/api/v2/imports', data)
      .then(this.handleImportContactSuccess, this.handleImportContactError)
      .then(() => this.setState({ isLoading: false }));
  };

  handleImportContactSuccess = () => {
    this.setState({ hasImported: true }, () => {
      const { onUploadSuccess, notifySuccess, i18n } = this.props;
      notifySuccess({
        message: i18n._(
          /* i18n */ 'import-contact.feedback.successfull',
          null,
          {
            message: 'Contacts successfully imported',
          }
        ),
        duration: 0,
      });
      onUploadSuccess();
    });
  };

  handleImportContactError = ({ response }) => {
    const { notifyError, i18n } = this.props;

    if (response.status === 400) {
      return notifyError({
        message: i18n._(/* i18n */ 'import-contact.feedback.error-file', null, {
          message: 'This file cannot be used to import contacts',
        }),
        duration: 0,
      });
    }

    if (response.status === 422) {
      return notifyError({
        message: i18n._(
          /* i18n */ 'import-contact.feedback.error-contact',
          null,
          {
            message: 'The file is valid but new contacts cannot be created',
          }
        ),
        duration: 0,
      });
    }

    return notifyError({
      message: i18n._(
        /* i18n */ 'import-contact.feedback.unexpected-error',
        null,
        {
          message: 'An unexpected error occured.',
        }
      ),
      duration: 0,
    });
  };

  render() {
    const { onCancel } = this.props;

    return (
      <ImportContactForm
        onCancel={onCancel}
        onSubmit={this.handleImportContact}
        errors={this.state.errors}
        hasImported={this.state.hasImported}
        isLoading={this.state.isLoading}
      />
    );
  }
}

export default ImportContact;
