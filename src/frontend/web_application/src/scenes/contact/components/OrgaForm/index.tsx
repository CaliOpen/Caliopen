import * as React from 'react';
import { Field } from 'formik';
import { Trans, withI18n, withI18nProps } from '@lingui/react';
import { FormikTextFieldGroup } from 'src/components/TextFieldGroup';
import {
  Icon,
  Button,
  Fieldset,
  Legend,
  FormGrid,
  FormRow,
  FormColumn,
} from 'src/components';
import { validateRequired } from 'src/modules/form/services/validators';
import './style.scss';
import { ItemProps } from '../FormCollection';

function OrgaForm({
  name,
  i18n,
  onDelete,
}: ItemProps & withI18nProps): React.ReactElement<typeof FormGrid> {
  return (
    <FormGrid className="m-orga-form">
      <Fieldset>
        <FormRow>
          <FormColumn>
            <Legend>
              <Icon rightSpaced type="building" />
              <Trans id="contact.orga_form.legend" message="Organization" />
            </Legend>
          </FormColumn>
        </FormRow>
        <FormRow>
          <FormColumn rightSpace={false} bottomSpace>
            <Field
              component={FormikTextFieldGroup}
              name={`${name}.label`}
              label={i18n._(
                /* i18n */ 'contact.orga_form.label.label',
                undefined,
                {
                  message: 'Label',
                }
              )}
              inputProps={{
                placeholder: i18n._(
                  /* i18n */ 'contact.orga_form.label.label',
                  undefined,
                  {
                    message: 'Label',
                  }
                ),
                expanded: true,
              }}
            />
          </FormColumn>
          <FormColumn rightSpace={false} bottomSpace>
            <Field
              component={FormikTextFieldGroup}
              name={`${name}.name`}
              validate={validateRequired(i18n)}
              label={i18n._(
                /* i18n */ 'contact.orga_form.name.label',
                undefined,
                {
                  message: 'Name',
                }
              )}
              inputProps={{
                placeholder: i18n._(
                  /* i18n */ 'contact.orga_form.name.label',
                  undefined,
                  {
                    message: 'Name',
                  }
                ),
                expanded: true,
                required: true,
              }}
            />
          </FormColumn>
          <FormColumn rightSpace={false} bottomSpace>
            <Field
              component={FormikTextFieldGroup}
              name={`${name}.title`}
              label={i18n._(
                /* i18n */ 'contact.orga_form.title.label',
                undefined,
                {
                  message: 'Title',
                }
              )}
              inputProps={{
                placeholder: i18n._(
                  /* i18n */ 'contact.orga_form.title.label',
                  undefined,
                  {
                    message: 'Title',
                  }
                ),
                expanded: true,
              }}
            />
          </FormColumn>
          <FormColumn rightSpace={false} bottomSpace>
            <Field
              component={FormikTextFieldGroup}
              name={`${name}.department`}
              label={i18n._(
                /* i18n */ 'contact.orga_form.department.label',
                undefined,
                {
                  message: 'Department',
                }
              )}
              inputProps={{
                placeholder: i18n._(
                  /* i18n */ 'contact.orga_form.department.label',
                  undefined,
                  { message: 'Department' }
                ),
                expanded: true,
              }}
            />
          </FormColumn>
          <FormColumn rightSpace={false} bottomSpace>
            <Field
              component={FormikTextFieldGroup}
              name={`${name}.job_description`}
              label={i18n._(
                /* i18n */ 'contact.orga_form.job_description.label'
              )}
              inputProps={{
                placeholder: i18n._(
                  /* i18n */ 'contact.orga_form.job_description.label'
                ),
                expanded: true,
              }}
            />
          </FormColumn>
          <FormColumn className="m-orga-form__col-button" rightSpace={false}>
            <Button icon="remove" color="alert" onClick={onDelete}>
              <Trans id="contact.orga_form.remove-button" message="Remove" />
            </Button>
          </FormColumn>
        </FormRow>
      </Fieldset>
    </FormGrid>
  );
}

export default withI18n()(OrgaForm);
