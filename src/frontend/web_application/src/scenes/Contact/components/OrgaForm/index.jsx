import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Field } from 'redux-form';
import { Trans, withI18n } from '@lingui/react';
import {
  Icon,
  Button,
  FieldErrors,
  TextFieldGroup as TextFieldGroupBase,
  Fieldset,
  Legend,
  FormGrid,
  FormRow,
  FormColumn,
} from '../../../../components';
import renderReduxField from '../../../../services/renderReduxField';
import './style.scss';

const TextFieldGroup = renderReduxField(TextFieldGroupBase);

@withI18n()
class OrgaForm extends Component {
  static propTypes = {
    errors: PropTypes.arrayOf(PropTypes.string),
    onDelete: PropTypes.func.isRequired,
    i18n: PropTypes.shape({ _: PropTypes.func }).isRequired,
  };

  static defaultProps = {
    errors: [],
  };

  render() {
    const { i18n, errors, onDelete } = this.props;

    return (
      <FormGrid className="m-orga-form">
        <Fieldset>
          <FormRow>
            <FormColumn>
              <Legend>
                <Icon rightSpaced type="building" />
                <Trans id="contact.orga_form.legend">Organization</Trans>
              </Legend>
            </FormColumn>
            {errors.length > 0 && (
              <FormColumn>
                <FieldErrors errors={errors} />
              </FormColumn>
            )}
          </FormRow>
          <FormRow>
            <FormColumn rightSpace={false} bottomSpace>
              <Field
                component={TextFieldGroup}
                name="label"
                label={i18n._('contact.orga_form.label.label', null, {
                  defaults: 'Label',
                })}
                placeholder={i18n._('contact.orga_form.label.label', null, {
                  defaults: 'Label',
                })}
              />
            </FormColumn>
            <FormColumn rightSpace={false} bottomSpace>
              <Field
                component={TextFieldGroup}
                name="name"
                label={i18n._('contact.orga_form.name.label', null, {
                  defaults: 'Name',
                })}
                placeholder={i18n._('contact.orga_form.name.label', null, {
                  defaults: 'Name',
                })}
                required
              />
            </FormColumn>
            <FormColumn rightSpace={false} bottomSpace>
              <Field
                component={TextFieldGroup}
                name="title"
                label={i18n._('contact.orga_form.title.label', null, {
                  defaults: 'Title',
                })}
                placeholder={i18n._('contact.orga_form.title.label', null, {
                  defaults: 'Title',
                })}
              />
            </FormColumn>
            <FormColumn rightSpace={false} bottomSpace>
              <Field
                component={TextFieldGroup}
                name="department"
                label={i18n._('contact.orga_form.department.label', null, {
                  defaults: 'Department',
                })}
                placeholder={i18n._(
                  'contact.orga_form.department.label',
                  null,
                  { defaults: 'Department' }
                )}
              />
            </FormColumn>
            <FormColumn rightSpace={false} bottomSpace>
              <Field
                component={TextFieldGroup}
                name="job_description"
                label={i18n._('contact.orga_form.job_description.label')}
                placeholder={i18n._('contact.orga_form.job_description.label')}
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
