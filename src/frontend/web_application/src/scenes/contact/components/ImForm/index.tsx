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
  SelectFieldGroup as SelectFieldGroupBase,
  Fieldset,
  Legend,
  FormGrid,
  FormRow,
  FormColumn,
} from '../../../../components';
import './style.scss';

const IM_TYPES = ['', 'work', 'home', 'other', 'netmeeting'];
const SelectFieldGroup = renderReduxField(SelectFieldGroupBase);

// @ts-expect-error ts-migrate(1238) FIXME: Unable to resolve signature of class decorator whe... Remove this comment to see the full error message
@withI18n()
class ImForm extends React.PureComponent {
  static propTypes = {
    errors: PropTypes.arrayOf(PropTypes.string),
    onDelete: PropTypes.func.isRequired,
    i18n: PropTypes.shape({ _: PropTypes.func }).isRequired,
  };

  static defaultProps = {
    errors: [],
  };

  addressTypes: any;

  UNSAFE_componentWillMount() {
    this.initTranslations();
  }

  initTranslations() {
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'i18n' does not exist on type 'Readonly<{... Remove this comment to see the full error message
    const { i18n } = this.props;

    this.addressTypes = {
      work: i18n._('contact.im_type.work', null, { defaults: 'Professional' }),
      home: i18n._('contact.im_type.home', null, { defaults: 'Personal' }),
      other: i18n._('contact.im_type.other', null, { defaults: 'Other' }),
      netmeeting: i18n._('contact.im_type.netmeeting', null, {
        defaults: 'Netmeeting',
      }),
    };
  }

  render() {
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'i18n' does not exist on type 'Readonly<{... Remove this comment to see the full error message
    const { i18n, errors = [], onDelete } = this.props;
    const addressTypeOptions = IM_TYPES.map((value) => ({
      value,
      label: this.addressTypes[value] || '',
    }));

    return (
      <FormGrid className="m-im-form">
        <Fieldset>
          <FormRow>
            <FormColumn size="shrink">
              <Legend>
                <Icon type="comment" rightSpaced />
                <span className="m-im-form__legend">
                  <Trans id="contact.im_form.legend">Instant messaging</Trans>
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
                label={i18n._('contact.im_form.type.label', null, {
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
                label={i18n._('contact.im_form.address.label', null, {
                  defaults: 'Address',
                })}
                inputProps={{
                  placeholder: i18n._(
                    'contact.im_form.address.placeholder',
                    null,
                    {
                      defaults: 'Address',
                    }
                  ),
                  expanded: true,
                }}
                showLabelforSr
                required
              />
            </FormColumn>
            <FormColumn className="m-im-form__col-button">
              <Button color="alert" icon="remove" onClick={onDelete} />
            </FormColumn>
          </FormRow>
        </Fieldset>
      </FormGrid>
    );
  }
}

export default ImForm;
