import * as React from 'react';
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

// @ts-expect-error ts-migrate(1238) FIXME: Unable to resolve signature of class decorator whe... Remove this comment to see the full error message
@withI18n()
class PublicKeyForm extends React.PureComponent {
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
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'contactId' does not exist on type 'Reado... Remove this comment to see the full error message
    const { contactId, publicKey, deletePublicKey, onSuccess } = this.props;

    deletePublicKey({ contactId, publicKeyId: publicKey.key_id });
    onSuccess();
  };

  render() {
    const {
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'form' does not exist on type 'Readonly<{... Remove this comment to see the full error message
      form,
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'errors' does not exist on type 'Readonly... Remove this comment to see the full error message
      errors,
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'i18n' does not exist on type 'Readonly<{... Remove this comment to see the full error message
      i18n,
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'publicKey' does not exist on type 'Reado... Remove this comment to see the full error message
      publicKey,
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'onCancel' does not exist on type 'Readon... Remove this comment to see the full error message
      onCancel,
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'handleSubmit' does not exist on type 'Re... Remove this comment to see the full error message
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
                  <Trans
                    id="contact.public_key_form.legend"
                    message="Public Key"
                  />
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
                  label={i18n._(
                    /* i18n */ 'contact.public_key_form.label.label',
                    null,
                    {
                      message: 'Key label',
                    }
                  )}
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
                  label={i18n._(
                    /* i18n */ 'contact.public_key_form.key.label',
                    null,
                    {
                      message: 'Key (ascii armored)',
                    }
                  )}
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
                // @ts-expect-error ts-migrate(2322) FIXME: Type '{ children: (Element | null)[]; className: s... Remove this comment to see the full error message
                rightSpaced={false}
              >
                {publicKey ? (
                  <Confirm
                    onConfirm={this.handleDelete}
                    title={i18n._(
                      /* i18n */ 'contact.public_key_form.confirm_delete.title',
                      null,
                      { message: 'Delete public key' }
                    )}
                    content={i18n._(
                      /* i18n */ 'contact.public_key_form.confirm_delete.content',
                      {
                        label: publicKey.label,
                        fingerprint: publicKey.fingerprint,
                      },
                      {
                        message:
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
                        <Trans
                          id="contact.public_key_form.delete_key"
                          message="Delete Key"
                        />
                      </Button>
                    )}
                  />
                ) : null}
                <Button
                  icon="remove"
                  className="m-public-key-form__button-cancel"
                  onClick={onCancel}
                >
                  <Trans id="contact.public_key_form.cancel" message="Cancel" />
                </Button>
                <Button
                  type="submit"
                  icon="check"
                  shape="plain"
                  className="m-public-key-form__button-validate"
                >
                  <Trans
                    id="contact.public_key_form.validate"
                    message="Validate"
                  />
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
