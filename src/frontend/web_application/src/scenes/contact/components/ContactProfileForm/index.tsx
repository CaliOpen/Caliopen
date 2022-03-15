import { Trans, withI18n, withI18nProps } from '@lingui/react';
import * as React from 'react';
import { Field } from 'formik';
import { Button, FormikTextFieldGroup } from 'src/components';
import ContactTitleField from '../ContactTitleField';
import './style.scss';

interface Props extends withI18nProps {
  isNew?: boolean;
}
function ContactProfileForm({ isNew = false, i18n }: Props) {
  const [isExpanded, setIsExpanded] = React.useState(isNew);

  const toggleExpandForm = () => {
    setIsExpanded((prevState) => !prevState);
  };

  return (
    <div className="m-contact-profile-form">
      <div className="m-contact-profile-form__header">
        <Field>
          {({ field }) => (
            <ContactTitleField
              contact={field.value}
              onClick={toggleExpandForm}
              className="m-contact-profile-form__title"
            />
          )}
        </Field>
        <Button
          icon={isExpanded ? 'caret-up' : 'caret-down'}
          display="inline"
          onClick={toggleExpandForm}
          className="m-contact-profile-form__expand-button"
        >
          <span className="show-for-sr">
            <Trans id="contact_profile.action.edit_contact" message="Edit" />
          </span>
        </Button>
      </div>

      {isExpanded && (
        <div className="m-contact-profile-form__expanded-form">
          <Field
            id="name_prefix"
            component={FormikTextFieldGroup}
            inputProps={{
              // name: 'name_prefix',
              placeholder: i18n._(
                /* i18n */ 'contact_profile.form.name-prefix.label',
                undefined,
                { message: 'Prefix' }
              ),
              expanded: true,
            }}
            showLabelforSr
            className="m-contact-profile-form__input"
            label={i18n._(
              /* i18n */ 'contact_profile.form.name-prefix.label',
              undefined,
              {
                message: 'Prefix',
              }
            )}
            name="name_prefix"
          />
          <Field
            id="given_name"
            component={FormikTextFieldGroup}
            className="m-contact-profile-form__input"
            label={i18n._(
              /* i18n */ 'contact_profile.form.firstname.label',
              undefined,
              {
                message: 'Firstname',
              }
            )}
            inputProps={{
              placeholder: i18n._(
                /* i18n */ 'contact_profile.form.firstname.label',
                undefined,
                { message: 'Firstname' }
              ),
              expanded: true,
            }}
            name="given_name"
            showLabelforSr
          />
          <Field
            id="family_name"
            component={FormikTextFieldGroup}
            className="m-contact-profile-form__input"
            label={i18n._(
              /* i18n */ 'contact_profile.form.lastname.label',
              undefined,
              {
                message: 'Lastname',
              }
            )}
            inputProps={{
              placeholder: i18n._(
                /* i18n */ 'contact_profile.form.lastname.label',
                undefined,
                {
                  message: 'Lastname',
                }
              ),
              expanded: true,
            }}
            name="family_name"
            showLabelforSr
          />
          <Field
            id="name_suffix"
            component={FormikTextFieldGroup}
            className="m-contact-profile-form__input"
            label={i18n._(
              /* i18n */ 'contact_profile.form.name-suffix.label',
              undefined,
              {
                message: 'Suffix',
              }
            )}
            inputProps={{
              placeholder: i18n._(
                /* i18n */ 'contact_profile.form.name-suffix.label',
                undefined,
                { message: 'Suffix' }
              ),
              expanded: true,
            }}
            name="name_suffix"
            showLabelforSr
          />
        </div>
      )}
    </div>
  );
}

export default withI18n()(ContactProfileForm);
