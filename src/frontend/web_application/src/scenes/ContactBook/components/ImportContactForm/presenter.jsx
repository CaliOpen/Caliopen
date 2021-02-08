import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Trans, withI18n } from '@lingui/react';
import { Button, InputFileGroup, Spinner } from '../../../../components';
import { getMaxSize } from '../../../../services/config';

import './style.scss';

const VALID_EXT = ['.vcf', '.vcard']; // Valid file extensions for input#file

@withI18n()
class ImportContactForm extends Component {
  static propTypes = {
    onSubmit: PropTypes.func.isRequired,
    onCancel: PropTypes.func,
    errors: PropTypes.shape({}),
    i18n: PropTypes.shape({ _: PropTypes.func }).isRequired,
    hasImported: PropTypes.bool,
    isLoading: PropTypes.bool,
  };

  static defaultProps = {
    onCancel: null,
    errors: {},
    hasImported: false,
    isLoading: false,
  };

  state = {
    file: null,
  };

  handleInputFileChange = (file) => {
    this.setState({
      file,
    });
  };

  handleSubmitForm = (ev) => {
    ev.preventDefault();
    const { file } = this.state;
    this.props.onSubmit({ file });
  };

  renderButtons() {
    const { onCancel, isLoading } = this.props;

    return (
      <div className="m-import-contact-form__buttons">
        {!this.props.hasImported && (
          <Button
            className="m-import-contact-form__button"
            shape="hollow"
            onClick={onCancel}
          >
            <Trans id="general.action.cancel">Cancel</Trans>
          </Button>
        )}

        {this.state.file && !this.props.hasImported && (
          <Button
            className="m-import-contact-form__button m-import-contact-form__button--right"
            type="submit"
            shape="plain"
            icon={
              isLoading ? <Spinner isLoading display="inline" /> : 'download'
            }
            disabled={isLoading}
          >
            <Trans id="import-contact.action.import">Import</Trans>
          </Button>
        )}

        {this.props.hasImported && (
          <Button
            className="m-import-contact-form__button m-import-contact-form__button--right"
            shape="plain"
            onClick={onCancel}
          >
            <Trans id="import-contact.form.button.close">Close</Trans>
          </Button>
        )}
      </div>
    );
  }

  render() {
    const { i18n, hasImported, errors } = this.props;

    return (
      <form
        className="m-import-contact-form"
        onSubmit={this.handleSubmitForm}
        method="post"
        encType="multipart/form-data"
      >
        {!hasImported ? (
          <InputFileGroup
            onInputChange={this.handleInputFileChange}
            errors={errors}
            descr={i18n._('import-contact.form.descr', null, {
              defaults: 'You can import one .vcf or .vcard file.',
            })}
            fileTypes={VALID_EXT}
            maxSize={getMaxSize()}
          />
        ) : (
          <p>
            <Trans id="import-contact.form.success">
              Successfuly imported !
            </Trans>
          </p>
        )}
        {this.renderButtons()}
      </form>
    );
  }
}

export default ImportContactForm;
