import * as React from 'react';
import PropTypes from 'prop-types';
import { Field } from 'redux-form';
import { Trans, withI18n } from '@lingui/react';
import { ReduxTextFieldGroup } from 'src/components/TextFieldGroup';
import renderReduxField from '../../../../services/renderReduxField';
import {
  Button,
  Icon,
  FieldErrors,
  TextFieldGroup as TextFieldGroupBase,
  SelectFieldGroup as SelectFieldGroupBase,
  Fieldset,
  Legend,
  FormGrid,
  FormRow,
  FormColumn,
} from '../../../../components';
import './style.scss';

const EMAIL_TYPES = ['', 'work', 'home', 'other'];
const SelectFieldGroup = renderReduxField(SelectFieldGroupBase);

// @ts-expect-error ts-migrate(1238) FIXME: Unable to resolve signature of class decorator whe... Remove this comment to see the full error message
@withI18n()
class EmailForm extends React.PureComponent {
  static propTypes = {
    errors: PropTypes.arrayOf(PropTypes.string),
    onDelete: PropTypes.func,
    i18n: PropTypes.shape({ _: PropTypes.func }).isRequired,
  };

  static defaultProps = {
    errors: [],
    onDelete: () => {
      // noop
    },
  };

  addressTypes: any;

  UNSAFE_componentWillMount() {
    this.initTranslations();
  }

  initTranslations() {
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'i18n' does not exist on type 'Readonly<{... Remove this comment to see the full error message
    const { i18n } = this.props;
    this.addressTypes = {
      work: i18n._('contact.email_type.work', null, {
        defaults: 'Professional',
      }),
      home: i18n._('contact.email_type.home', null, { defaults: 'Personal' }),
      other: i18n._('contact.email_type.other', null, { defaults: 'Other' }),
    };
  }

  render() {
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'i18n' does not exist on type 'Readonly<{... Remove this comment to see the full error message
    const { i18n, errors = [], onDelete } = this.props;
    const addressTypeOptions = EMAIL_TYPES.map((value) => ({
      value,
      label: this.addressTypes[value] || '',
    }));

    return (
      <FormGrid className="m-email-form">
        <Fieldset>
          <FormRow>
            <FormColumn size="shrink">
              <Legend>
                <Icon type="envelope" />
                <span className="m-email-form__legend">
                  <Trans id="contact.email_form.legend">Email</Trans>
                </span>
              </Legend>
            </FormColumn>
            {errors.length > 0 && (
              <FormColumn>
                <FieldErrors errors={errors} />
              </FormColumn>
            )}
            <FormColumn size="shrink" bottomSpace>
              <Field
                component={SelectFieldGroup}
                name="type"
                label={i18n._('contact.email_form.type.label', null, {
                  defaults: 'Type',
                })}
                showLabelforSr
                options={addressTypeOptions}
              />
            </FormColumn>
            <FormColumn size="medium" fluid bottomSpace>
              <Field
                component={ReduxTextFieldGroup}
                name="address"
                type="email"
                label={i18n._('contact.email_form.address.label', null, {
                  defaults: 'Address',
                })}
                inputProps={{
                  placeholder: i18n._(
                    'contact.email_form.address.placeholder',
                    null,
                    { defaults: 'Email' }
                  ),
                  expanded: true,
                }}
                showLabelforSr
                required
              />
            </FormColumn>
            <FormColumn className="m-email-form__col-button">
              <Button icon="remove" color="alert" onClick={onDelete} />
            </FormColumn>
          </FormRow>
        </Fieldset>
      </FormGrid>
    );
  }
}

export default EmailForm;
