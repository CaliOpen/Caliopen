import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Trans } from '@lingui/react';
import { Section, PageTitle, Button, FieldErrors } from '../../components';
import InterfaceSettings from './components/InterfaceSettings';
import MessageSettings from './components/MessageSettings';
import ContactSettings from './components/ContactSettings';
import NotificationSettings from './components/NotificationSettings';
import DesktopNotificationSettings from './components/DesktopNotificationSettings';
import './style.scss';

class ApplicationSettings extends PureComponent {
  static propTypes = {
    handleSubmit: PropTypes.func.isRequired,
    requestSettings: PropTypes.func.isRequired,
    notifyError: PropTypes.func.isRequired,
    notifySuccess: PropTypes.func.isRequired,
    errors: PropTypes.shape({}),
    i18n: PropTypes.shape({ _: PropTypes.func }).isRequired,
  };

  static defaultProps = {
    errors: {},
  };

  handleSubmit = (ev) => {
    /* TODO: autosave settings */
    const { handleSubmit } = this.props;
    handleSubmit(ev).then(this.handleSuccess, this.handleError);
  };

  handleSuccess = async () => {
    const { i18n, notifySuccess, requestSettings } = this.props;
    await requestSettings();

    return notifySuccess({
      message: i18n._('settings.form.feedback.successfull', null, {
        defaults: 'Settings successfully updated!',
      }),
    });
  };

  handleError = () => {
    const { i18n, notifyError } = this.props;
    notifyError({
      message: i18n._('settings.form.feedback.unexpected-error', null, {
        defaults: 'Error when updating settings.',
      }),
    });
  };

  render() {
    const { errors, i18n } = this.props;

    return (
      <form
        method="post"
        className="s-application-settings"
        name="settings_application_form"
        onSubmit={this.handleSubmit}
      >
        <PageTitle />
        {errors.global && errors.global.length !== 0 && (
          <FieldErrors errors={errors.global} />
        )}
        <div className="s-application-settings__col-sections">
          <Section
            title={i18n._('settings.interface.title', null, {
              defaults: 'Customize your interface',
            })}
          >
            <InterfaceSettings />
          </Section>
        </div>
        <div className="s-application-settings__col-sections">
          <Section
            title={i18n._('settings.message.title', null, {
              defaults: 'Messages settings',
            })}
          >
            <MessageSettings />
          </Section>
        </div>
        <div className="s-application-settings__col-sections">
          <Section
            className="s-application-settings__section"
            title={i18n._('settings.contact.title', null, {
              defaults: 'Contact settings',
            })}
          >
            <ContactSettings />
          </Section>
        </div>
        <div className="s-application-settings__col-sections">
          <Section
            title={i18n._('settings.notification.title', null, {
              defaults: 'Notifications settings',
            })}
          >
            <NotificationSettings />
          </Section>
          <Section
            title={i18n._('settings.desktop_notification.title', null, {
              defaults: 'Desktop notifications settings',
            })}
          >
            <DesktopNotificationSettings />
          </Section>
        </div>

        <div className="s-application-settings__action">
          <Button type="submit" shape="plain" icon="check">
            <Trans id="settings.presentation.update.action">
              Save settings
            </Trans>
          </Button>
        </div>
      </form>
    );
  }
}

export default ApplicationSettings;
