import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Field } from 'redux-form';
import { withI18n, Trans } from '@lingui/react';
import renderReduxField from '../../../../services/renderReduxField';
import {
  Button,
  Confirm,
  FieldErrors,
  Fieldset,
  FormColumn,
  FormGrid,
  FormRow,
  Icon,
  Legend,
  TextFieldGroup as TextFieldGroupBase,
} from '../../../../components';
import { getMaxSize } from '../../../../services/config';
import ReduxedInputFileGroup from '../ReduxedInputFileGroup';

import './style.scss';

const TextFieldGroup = renderReduxField(TextFieldGroupBase);

@withI18n()
class PublicKeyForm extends PureComponent {
  static propTypes = {
    errors: PropTypes.arrayOf(PropTypes.string),
    i18n: PropTypes.shape({ _: PropTypes.func }).isRequired,
    contactId: PropTypes.string.isRequired,
    publicKey: PropTypes.shape({}),
    handleSubmit: PropTypes.func.isRequired,
    form: PropTypes.string.isRequired,
    deletePublicKey: PropTypes.func.isRequired,
    onSuccess: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,
  };

  static defaultProps = {
    publicKey: undefined,
    errors: [],
  };

  handleDelete = () => {
    const { contactId, publicKey, deletePublicKey, onSuccess } = this.props;

    deletePublicKey({ contactId, publicKeyId: publicKey.key_id });
    onSuccess();
  };

  render() {
    const {
      form,
      errors,
      i18n,
      publicKey,
      onCancel,
      handleSubmit,
    } = this.props;

    return (
      <form onSubmit={handleSubmit} method="post">
        <FormGrid className="m-public-key-form">
          <Fieldset>
            <FormRow>
              <FormColumn bottomSpace>
                <Legend>
                  <Icon rightSpaced type="key" />
                  <Trans id="contact.public_key_form.legend">Public Key</Trans>
                </Legend>
              </FormColumn>
              {errors.length > 0 && (
                <FormColumn>
                  <FieldErrors errors={errors} />
                </FormColumn>
              )}
            </FormRow>
            <FormRow>
              <FormColumn bottomSpace>
                <Field
                  component={TextFieldGroup}
                  name="label"
                  label={i18n._('contact.public_key_form.label.label', null, {
                    defaults: 'Key label',
                  })}
                  required
                  accept="application/x-pgp"
                />
              </FormColumn>
            </FormRow>
            <FormRow>
              <FormColumn bottomSpace>
                <Field
                  component={ReduxedInputFileGroup}
                  fileAsContent
                  label={i18n._('contact.public_key_form.key.label', null, {
                    defaults: 'Key (ascii armored)',
                  })}
                  maxSize={getMaxSize()}
                  name="key"
                  required={publicKey === undefined}
                  disabled={publicKey !== undefined}
                  type="file"
                  accept="application/x-pgp"
                />
              </FormColumn>
            </FormRow>
            <FormRow>
              <FormColumn
                className="m-public-key-form__actions"
                rightSpaced={false}
              >
                {publicKey ? (
                  <Confirm
                    onConfirm={this.handleDelete}
                    title={i18n._(
                      'contact.public_key_form.confirm_delete.title',
                      null,
                      { defaults: 'Delete public key' }
                    )}
                    content={i18n._(
                      'contact.public_key_form.confirm_delete.content',
                      {
                        label: publicKey.label,
                        fingerprint: publicKey.fingerprint,
                      },
                      {
                        defaults:
                          'Are you sure you want to delete the key "{label} - {fingerprint}" ? This action cannot be undone.',
                      }
                    )}
                    render={(confirm) => (
                      <Button
                        className="m-public-key-form__button-remove"
                        type="button"
                        color="alert"
                        icon="remove"
                        onClick={confirm}
                      >
                        <Trans id="contact.public_key_form.delete_key">
                          Delete Key
                        </Trans>
                      </Button>
                    )}
                  />
                ) : null}
                <Button
                  icon="remove"
                  className="m-public-key-form__button-cancel"
                  onClick={onCancel}
                >
                  <Trans id="contact.public_key_form.cancel">Cancel</Trans>
                </Button>
                <Button
                  type="submit"
                  icon="check"
                  shape="plain"
                  className="m-public-key-form__button-validate"
                >
                  <Trans id="contact.public_key_form.validate">Validate</Trans>
                </Button>
              </FormColumn>
            </FormRow>
          </Fieldset>
        </FormGrid>
      </form>
    );
  }
}

export default PublicKeyForm;
