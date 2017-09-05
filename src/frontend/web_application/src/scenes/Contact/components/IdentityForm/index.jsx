import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Field } from 'redux-form';
import { withTranslator } from '@gandi/react-translate';
import renderReduxField from '../../services/renderReduxField';
import Icon from '../../../../components/Icon';
import Button from '../../../../components/Button';
import { FieldErrors, Fieldset, Legend, TextFieldGroup as TextFieldGroupBase, SelectFieldGroup as SelectFieldGroupBase, FormGrid, FormRow, FormColumn } from '../../../../components/form';

import './style.scss';

const IDENTITY_TYPES = ['twitter', 'facebook'];
const TextFieldGroup = renderReduxField(TextFieldGroupBase);
const SelectFieldGroup = renderReduxField(SelectFieldGroupBase);

@withTranslator()
class IdentityForm extends PureComponent {
  static propTypes = {
    errors: PropTypes.arrayOf(PropTypes.string),
    onDelete: PropTypes.func.isRequired,
    __: PropTypes.func.isRequired,
  };
  static defaultProps = {
    errors: [],
  };

  render() {
    const { __, onDelete, errors } = this.props;
    const identityTypeOptions = IDENTITY_TYPES.map(value => ({
      value,
      label: value,
    }));

    return (
      <FormGrid className="m-identity-form">
        <Fieldset>
          <FormRow>
            {errors.length > 0 && (<FormColumn><FieldErrors errors={errors} /></FormColumn>)}
            <FormColumn size="shrink">
              <Legend>
                <Icon rightSpaced type="user" />
                <span className="m-identity-form__legend">{__('contact.identity_form.legend')}</span>
              </Legend>
            </FormColumn>
            <FormColumn size="shrink" bottomSpace>
              <Field
                component={SelectFieldGroup}
                name="type"
                label={__('contact.identity_form.service.label')}
                options={identityTypeOptions}
                showLabelforSr
              />
            </FormColumn>
            <FormColumn size="medium" fluid bottomSpace>
              <Field
                component={TextFieldGroup}
                name="name"
                label={__('contact.identity_form.identity.label')}
                showLabelforSr
              />
            </FormColumn>
            <FormColumn className="m-identity-form__col-button">
              <Button color="alert" icon="remove" onClick={onDelete} />
            </FormColumn>
          </FormRow>
        </Fieldset>
      </FormGrid>
    );
  }
}

export default IdentityForm;
