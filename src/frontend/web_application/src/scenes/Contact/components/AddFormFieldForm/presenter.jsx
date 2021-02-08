import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Trans } from '@lingui/react';
import TextList, { TextItem } from '../../../../components/TextList';
import {
  Button,
  Icon,
  SelectFieldGroup,
  FormGrid,
  FormRow,
  FormColumn,
  Legend,
} from '../../../../components';
import './style.scss';

class AddFormFieldForm extends Component {
  static propTypes = {
    form: PropTypes.string.isRequired,
    addFieldToCollection: PropTypes.func.isRequired,
    changeField: PropTypes.func.isRequired,
    // formValues: PropTypes.shape({}).isRequired,
    i18n: PropTypes.shape({ _: PropTypes.func }).isRequired,
  };

  static defaultProps = {};

  state = {
    formType: 'emails',
  };

  handleSelectChange = (ev) => {
    const { value } = ev.target;
    this.setState({
      formType: value,
    });
  };

  handleAddForm = () => {
    const { form, addFieldToCollection, changeField } = this.props;

    if (this.state.formType.indexOf('info') >= 0) {
      return changeField(form, this.state.formType, '');
    }

    return addFieldToCollection(form, `${this.state.formType}`, {});
  };

  render() {
    const { i18n } = this.props;
    // FIXME: an autofilled field is removed on blur or change to empty https://github.com/erikras/redux-form/issues/3366
    // const { formValues: { info }, i18n } = this.props;
    // const hasBirthday = info && info.birthday && info.birthday.length > 0;

    const typeOptions = [
      {
        label: i18n._('contact.form-selector.email_form.label', null, {
          defaults: 'Email',
        }),
        value: 'emails',
      },
      {
        label: i18n._('contact.form-selector.phone_form.label', null, {
          defaults: 'Phone',
        }),
        value: 'phones',
      },
      {
        label: i18n._('contact.form-selector.im_form.label', null, {
          defaults: 'IM',
        }),
        value: 'ims',
      },
      {
        label: i18n._('contact.form-selector.address_form.label', null, {
          defaults: 'Address',
        }),
        value: 'addresses',
      },
      // ...(hasBirthday ? [] : [{
      //   label:
      //    i18n._('contact.form-selector.birthday_form.label', null, { defaults: 'Birthday' }),
      //   value: 'info.birthday',
      // }]),
    ];

    if (!typeOptions.length) {
      return null;
    }

    return (
      <TextList className="m-add-form-field-form">
        <TextItem>
          <FormGrid>
            <FormRow>
              <FormColumn size="shrink">
                <Legend>
                  <Icon type="crosshairs" rightSpaced />
                  <span className="m-add-form-field-form__legend">
                    <Trans id="contact.form-selector.add_new_field.label">
                      Add a new field
                    </Trans>
                  </span>
                </Legend>
              </FormColumn>
              <FormColumn size="shrink" fluid bottomSpace>
                <SelectFieldGroup
                  name="selectedForm"
                  onChange={this.handleSelectChange}
                  value={this.state.formType}
                  options={typeOptions}
                  showLabelforSr
                  label={i18n._(
                    'contact.form-selector.add_new_field.label',
                    null,
                    { defaults: 'Add a new field' }
                  )}
                />
              </FormColumn>
              <FormColumn
                size="shrink"
                className="m-add-form-field-form__col-button"
              >
                <Button icon="plus" shape="plain" onClick={this.handleAddForm}>
                  <Trans id="contact.action.add_new_field">Add new</Trans>
                </Button>
              </FormColumn>
            </FormRow>
          </FormGrid>
        </TextItem>
      </TextList>
    );
  }
}

export default AddFormFieldForm;
