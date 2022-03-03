import * as React from 'react';
import { Trans, withI18nProps, withI18n } from '@lingui/react';
import { FieldArray } from 'formik';
import {
  Button,
  Icon,
  SelectFieldGroup,
  FormGrid,
  FormRow,
  FormColumn,
  Legend,
  TextList,
  TextItem,
} from 'src/components';
import {
  EmailPayload,
  IMPayload,
  PhonePayload,
} from 'src/modules/contact/types';
import './style.scss';

type FormType = 'emails' | 'phones' | 'ims';
type FormData = PhonePayload | EmailPayload | IMPayload;
const getNewFormData = (formType: FormType): FormData | undefined => {
  switch (formType) {
    case 'emails':
      return { type: '', address: '' };
    case 'phones':
      return { type: '', number: '' };
    case 'ims':
      return { type: '', address: '' };
    default:
      return undefined;
  }
};

type Props = withI18nProps;

function AddFormFieldForm({
  i18n,
}: Props): React.ReactElement<typeof TextList> {
  const [formType, setFormType] = React.useState<FormType>('emails');

  const handleSelectChange = (ev) => {
    const { value } = ev.target;
    setFormType(value);
  };

  const typeOptions = [
    {
      label: i18n._('contact.form-selector.email_form.label', undefined, {
        defaults: 'Email',
      }),
      value: 'emails',
    },
    {
      label: i18n._('contact.form-selector.phone_form.label', undefined, {
        defaults: 'Phone',
      }),
      value: 'phones',
    },
    {
      label: i18n._('contact.form-selector.im_form.label', undefined, {
        defaults: 'IM',
      }),
      value: 'ims',
    },
    // ...(hasBirthday ? [] : [{
    //   label:
    //    i18n._('contact.form-selector.birthday_form.label', undefined, { defaults: 'Birthday' }),
    //   value: 'info.birthday',
    // }]),
  ];

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
                onChange={handleSelectChange}
                value={formType}
                options={typeOptions}
                showLabelforSr
                label={i18n._(
                  'contact.form-selector.add_new_field.label',
                  undefined,
                  { defaults: 'Add a new field' }
                )}
              />
            </FormColumn>
            <FormColumn
              size="shrink"
              className="m-add-form-field-form__col-button"
            >
              <FieldArray
                name={formType}
                render={({ push }) => (
                  <Button
                    icon="plus"
                    shape="plain"
                    onClick={() => push(getNewFormData(formType))}
                  >
                    <Trans id="contact.action.add_new_field">Add new</Trans>
                  </Button>
                )}
              />
            </FormColumn>
          </FormRow>
        </FormGrid>
      </TextItem>
    </TextList>
  );
}

export default withI18n()(AddFormFieldForm);
