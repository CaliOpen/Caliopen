import * as React from 'react';
import PropTypes from 'prop-types';
import { Trans } from '@lingui/react';
import { Field } from 'redux-form';
import { ReduxTextFieldGroup } from 'src/components/TextFieldGroup';
import { Button } from 'src/components';
import ContactTitleField from '../ContactTitleField';
import './style.scss';

class ContactProfileForm extends React.Component {
  static propTypes = {
    i18n: PropTypes.shape({ _: PropTypes.func }).isRequired,
    form: PropTypes.string.isRequired,
    isNew: PropTypes.bool,
  };

  static defaultProps = {
    isNew: false,
  };

  state = {
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'isNew' does not exist on type 'Readonly<... Remove this comment to see the full error message
    isExpanded: this.props.isNew,
  };

  toggleExpandForm = () => {
    this.setState((prevState) => ({
      ...prevState,
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'isExpanded' does not exist on type 'Read... Remove this comment to see the full error message
      isExpanded: !prevState.isExpanded,
    }));
  };

  render() {
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'i18n' does not exist on type 'Readonly<{... Remove this comment to see the full error message
    const { i18n, form } = this.props;

    return (
      <div className="m-contact-profile-form">
        <div className="m-contact-profile-form__header">
          <ContactTitleField
            className="m-contact-profile-form__title"
            // @ts-expect-error ts-migrate(2322) FIXME: Type '{ className: string; form: any; onClick: () ... Remove this comment to see the full error message
            form={form}
            onClick={this.toggleExpandForm}
          />
          {this.state.isExpanded ? (
            <Button
              icon="caret-up"
              display="inline"
              onClick={this.toggleExpandForm}
              className="m-contact-profile-form__expand-button"
            >
              <span className="show-for-sr">
                <Trans id="contact_profile.action.edit_contact">Edit</Trans>
              </span>
            </Button>
          ) : (
            <Button
              icon="caret-down"
              display="inline"
              onClick={this.toggleExpandForm}
              className="m-contact-profile-form__expand-button"
            >
              <span className="show-for-sr">
                <Trans id="contact_profile.action.edit_contact">Edit</Trans>
              </span>
            </Button>
          )}
        </div>

        {this.state.isExpanded && (
          <div className="m-contact-profile-form__expanded-form">
            <Field
              component={ReduxTextFieldGroup}
              inputProps={{
                name: 'name_prefix',
                placeholder: i18n._(
                  'contact_profile.form.name-prefix.label',
                  null,
                  { defaults: 'Prefix' }
                ),
                expanded: true,
              }}
              showLabelforSr
              className="m-contact-profile-form__input"
              label={i18n._('contact_profile.form.name-prefix.label', null, {
                defaults: 'Prefix',
              })}
              name="name_prefix"
            />
            <Field
              component={ReduxTextFieldGroup}
              className="m-contact-profile-form__input"
              label={i18n._('contact_profile.form.firstname.label', null, {
                defaults: 'Firstname',
              })}
              inputProps={{
                placeholder: i18n._(
                  'contact_profile.form.firstname.label',
                  null,
                  { defaults: 'Firstname' }
                ),
                expanded: true,
              }}
              name="given_name"
              showLabelforSr
            />
            <Field
              component={ReduxTextFieldGroup}
              className="m-contact-profile-form__input"
              label={i18n._('contact_profile.form.lastname.label', null, {
                defaults: 'Lastname',
              })}
              inputProps={{
                placeholder: i18n._(
                  'contact_profile.form.lastname.label',
                  null,
                  {
                    defaults: 'Lastname',
                  }
                ),
                expanded: true,
              }}
              name="family_name"
              showLabelforSr
            />
            <Field
              component={ReduxTextFieldGroup}
              className="m-contact-profile-form__input"
              label={i18n._('contact_profile.form.name-suffix.label', null, {
                defaults: 'Suffix',
              })}
              inputProps={{
                placeholder: i18n._(
                  'contact_profile.form.name-suffix.label',
                  null,
                  { defaults: 'Suffix' }
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
}

export default ContactProfileForm;
