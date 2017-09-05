import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Field } from 'redux-form';
import { withTranslator } from '@gandi/react-translate';
import renderReduxField from '../../services/renderReduxField';
import Icon from '../../../../components/Icon';
import Button from '../../../../components/Button';
import { FieldErrors, Fieldset, Legend, TextFieldGroup as TextFieldGroupBase, SelectFieldGroup as SelectFieldGroupBase, FormGrid, FormRow, FormColumn } from '../../../../components/form';
import './style.scss';

const IM_TYPES = ['work', 'home', 'other', 'netmeeting'];
const TextFieldGroup = renderReduxField(TextFieldGroupBase);
const SelectFieldGroup = renderReduxField(SelectFieldGroupBase);

@withTranslator()
class ImForm extends PureComponent {
  static propTypes = {
    errors: PropTypes.arrayOf(PropTypes.string),
    onDelete: PropTypes.func.isRequired,
    __: PropTypes.func.isRequired,
  };
  static defaultProps = {
    errors: [],
  };

  componentWillMount() {
    this.initTranslations();
  }

  initTranslations() {
    const { __ } = this.props;

    this.addressTypes = {
      work: __('contact.im_type.work'),
      home: __('contact.im_type.home'),
      other: __('contact.im_type.other'),
      netmeeting: __('contact.im_type.netmeeting'),
    };
  }

  render() {
    const { __, errors = [], onDelete } = this.props;
    const addressTypeOptions = IM_TYPES.map(value => ({
      value,
      label: this.addressTypes[value],
    }));

    return (
      <FormGrid className="m-im-form">
        <Fieldset>
          <FormRow>
            <FormColumn size="shrink">
              <Legend>
                <Icon type="comment" rightSpaced />
                <span className="m-im-form__legend">{__('contact.im_form.legend')}</span>
              </Legend>
            </FormColumn>
            {errors.length > 0 && (<FormColumn><FieldErrors errors={errors} /></FormColumn>)}
            <FormColumn size="shrink" bottomSpace>
              <Field
                component={SelectFieldGroup}
                name="type"
                label={__('contact.im_form.type.label')}
                showLabelforSr
                options={addressTypeOptions}
              />
            </FormColumn>
            <FormColumn size="medium" fluid bottomSpace>
              <Field
                component={TextFieldGroup}
                name="address"
                type="email"
                label={__('contact.im_form.address.label')}
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
