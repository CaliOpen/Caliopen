import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Field } from 'redux-form';
import { withTranslator } from '@gandi/react-translate';
import Icon from '../../../../components/Icon';
import Button from '../../../../components/Button';
import { FieldErrors, Fieldset, Legend, TextFieldGroup as TextFieldGroupBase, FormGrid, FormRow, FormColumn } from '../../../../components/form';
import renderReduxField from '../../services/renderReduxField';
import './style.scss';

const TextFieldGroup = renderReduxField(TextFieldGroupBase);

@withTranslator()
class OrgaForm extends Component {
  static propTypes = {
    errors: PropTypes.arrayOf(PropTypes.string),
    onDelete: PropTypes.func.isRequired,
    __: PropTypes.func.isRequired,
  };
  static defaultProps = {
    errors: [],
  };

  render() {
    const { __, errors, onDelete } = this.props;

    return (
      <FormGrid className="m-orga-form">
        <Fieldset>
          <FormRow>
            <FormColumn>
              <Legend>
                <Icon rightSpaced type="building" />
                {__('contact.orga_form.legend')}
              </Legend>
            </FormColumn>
            {errors.length > 0 && (<FormColumn><FieldErrors errors={errors} /></FormColumn>)}
          </FormRow>
          <FormRow>
            <FormColumn size="medium" bottomSpace>
              <Field
                component={TextFieldGroup}
                name="label"
                label={__('contact.orga_form.label.label')}
                placeholder={__('contact.orga_form.label.label')}
                showLabelforSr
                required
              />
            </FormColumn>
            <FormColumn size="medium" bottomSpace>
              <Field
                component={TextFieldGroup}
                name="name"
                label={__('contact.orga_form.name.label')}
                placeholder={__('contact.orga_form.name.label')}
                showLabelforSr
                required
              />
            </FormColumn>
            <FormColumn size="medium" bottomSpace>
              <Field
                component={TextFieldGroup}
                name="title"
                label={__('contact.orga_form.title.label')}
                placeholder={__('contact.orga_form.title.label')}
                showLabelforSr
              />
            </FormColumn>
            <FormColumn size="medium" bottomSpace>
              <Field
                component={TextFieldGroup}
                name="department"
                label={__('contact.orga_form.department.label')}
                placeholder={__('contact.orga_form.department.label')}
                showLabelforSr
              />
            </FormColumn>
            <FormColumn size="medium" bottomSpace>
              <Field
                component={TextFieldGroup}
                name="job_description"
                label={__('contact.orga_form.job_description.label')}
                placeholder={__('contact.orga_form.job_description.label')}
                showLabelforSr
              />
            </FormColumn>
            <FormColumn className="m-orga-form__col-button">
              <Button icon="remove" color="alert" onClick={onDelete} />
            </FormColumn>
          </FormRow>
        </Fieldset>
      </FormGrid>
    );
  }
}

export default OrgaForm;
