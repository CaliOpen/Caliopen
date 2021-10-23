import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Field } from 'redux-form';
import { Trans, withI18n } from '@lingui/react';
import { ReduxTextFieldGroup } from 'src/components/TextFieldGroup';
import {
  Icon,
  Button,
  FieldErrors,
  Fieldset,
  Legend,
  FormGrid,
  FormRow,
  FormColumn,
} from '../../../../components';
import './style.scss';

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
                component={ReduxTextFieldGroup}
                name="label"
                label={i18n._('contact.orga_form.label.label', null, {
                  defaults: 'Label',
                })}
                inputProps={{
                  placeholder: i18n._('contact.orga_form.label.label', null, {
                    defaults: 'Label',
                  }),
                  expanded: true,
                }}
              />
            </FormColumn>
            <FormColumn rightSpace={false} bottomSpace>
              <Field
                component={ReduxTextFieldGroup}
                name="name"
                label={i18n._('contact.orga_form.name.label', null, {
                  defaults: 'Name',
                })}
                inputProps={{
                  placeholder: i18n._('contact.orga_form.name.label', null, {
                    defaults: 'Name',
                  }),
                  expanded: true,
                }}
                required
              />
            </FormColumn>
            <FormColumn rightSpace={false} bottomSpace>
              <Field
                component={ReduxTextFieldGroup}
                name="title"
                label={i18n._('contact.orga_form.title.label', null, {
                  defaults: 'Title',
                })}
                inputProps={{
                  placeholder: i18n._('contact.orga_form.title.label', null, {
                    defaults: 'Title',
                  }),
                  expanded: true,
                }}
              />
            </FormColumn>
            <FormColumn rightSpace={false} bottomSpace>
              <Field
                component={ReduxTextFieldGroup}
                name="department"
                label={i18n._('contact.orga_form.department.label', null, {
                  defaults: 'Department',
                })}
                inputProps={{
                  placeholder: i18n._(
                    'contact.orga_form.department.label',
                    null,
                    { defaults: 'Department' }
                  ),
                  expanded: true,
                }}
              />
            </FormColumn>
            <FormColumn rightSpace={false} bottomSpace>
              <Field
                component={ReduxTextFieldGroup}
                name="job_description"
                label={i18n._('contact.orga_form.job_description.label')}
                inputProps={{
                  placeholder: i18n._(
                    'contact.orga_form.job_description.label'
                  ),
                  expanded: true,
                }}
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
