import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Trans } from '@lingui/react';
import { Field } from 'redux-form';
import renderReduxField from '../../../../services/renderReduxField';
import {
  Button,
  Icon,
  FieldErrors,
  DatePickerGroup as DatePickerGroupBase,
  Fieldset,
  Legend,
  FormGrid,
  FormRow,
  FormColumn,
} from '../../../../components';

const DatePickerGroup = renderReduxField(DatePickerGroupBase);

class BirthdayForm extends PureComponent {
  static propTypes = {
    i18n: PropTypes.shape({ _: PropTypes.func }).isRequired,
    form: PropTypes.string.isRequired,
    changeField: PropTypes.func.isRequired,
    errors: PropTypes.arrayOf(PropTypes.shape({})),
  };

  static defaultProps = {
    errors: [],
  };

  // handleBirthdayChanges = (date) => {
  //   this.setState(prevState => ({
  //     contact: {
  //       ...prevState.contact,
  //       infos: {
  //         ...prevState.contact.infos,
  //         birthday: date.format('YYYY-MM-DD'),
  //       },
  //     },
  //   }));
  // }

  handleDelete = () => {
    const { changeField, form } = this.props;
    // tips to remove a field: `change` handle empty string and launch unregister field action
    changeField(form, 'info.birthday', '');
  };

  render() {
    const { i18n, errors } = this.props;

    return (
      <FormGrid className="m-email-form">
        <Fieldset>
          <FormRow>
            <FormColumn size="shrink">
              <Legend>
                <Icon type="envelope" rightSpaced />
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
              {/* // prevent selecting dates after today
                  // see https://github.com/Hacker0x01/react-datepicker */}
              <Field
                component={DatePickerGroup}
                name="info.birthday"
                id="contact-form-birthday"
                className="m-contact-profile-form__birthday"
                inputClassName="m-contact-profile-form__birthday-input"
                label={i18n._('contact_profile.form.birthday.label', null, {
                  defaults: 'Birthday',
                })}
                onDateChange={this.handleBirthdayChanges}
                showMonthDropdown
                showYearDropdown
                dropdownMode="select"
                // selected={this.state.contact.infos.birthday ?
                //   this.state.contact.infos.birthday : null}
              />
            </FormColumn>
            <FormColumn className="m-birthday-form__col-button">
              <Button icon="remove" color="alert" onClick={this.handleDelete} />
            </FormColumn>
          </FormRow>
        </Fieldset>
      </FormGrid>
    );
  }
}

export default BirthdayForm;
