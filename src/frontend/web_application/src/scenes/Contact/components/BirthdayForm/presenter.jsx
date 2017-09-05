import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Field } from 'redux-form';
import renderReduxField from '../../services/renderReduxField';
import { FieldErrors, Fieldset, Legend, DatePickerGroup as DatePickerGroupBase, FormGrid, FormRow, FormColumn } from '../../../../components/form';
import Icon from '../../../../components/Icon';
import Button from '../../../../components/Button';

const DatePickerGroup = renderReduxField(DatePickerGroupBase);

class BirthdayForm extends PureComponent {
  static propTypes = {
    __: PropTypes.func.isRequired,
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
    const { __, errors } = this.props;

    return (
      <FormGrid className="m-email-form">
        <Fieldset>
          <FormRow>
            <FormColumn size="shrink">
              <Legend>
                <Icon type="envelope" rightSpaced />
                <span className="m-email-form__legend">{__('contact.email_form.legend')}</span>
              </Legend>
            </FormColumn>
            {errors.length > 0 && (<FormColumn><FieldErrors errors={errors} /></FormColumn>)}
            <FormColumn size="shrink" bottomSpace>
              {/* // prevent selecting dates after today
                  // see https://github.com/Hacker0x01/react-datepicker */}
              <Field
                component={DatePickerGroup}
                name="info.birthday"
                id="contact-form-birthday"
                className="m-contact-profile-form__birthday"
                inputClassName="m-contact-profile-form__birthday-input"
                label={__('contact_profile.form.birthday.label')}
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
