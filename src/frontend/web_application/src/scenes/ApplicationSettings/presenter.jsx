import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import Section from '../../components/Section';
import Button from '../../components/Button';
import PageTitle from '../../components/PageTitle';
import { FieldErrors } from '../../components/form';
import InterfaceSettings from './components/InterfaceSettings';
import MessageSettings from './components/MessageSettings';
import ContactSettings from './components/ContactSettings';
import NotificationSettings from './components/NotificationSettings';
import DesktopNotificationSettings from './components/DesktopNotificationSettings';

class ApplicationSettings extends PureComponent {
  static propTypes = {
    handleSubmit: PropTypes.func.isRequired,
    requestSettings: PropTypes.func.isRequired,
    errors: PropTypes.shape({}),
    __: PropTypes.func.isRequired,
  };
  static defaultProps = {
    errors: {},
  };

  handleSubmit = (ev) => {
    const { handleSubmit, requestSettings } = this.props;

    return handleSubmit(ev).then(requestSettings);
  }

  render() {
    const { errors, __ } = this.props;

    return (
      <form method="post" name="settings_application_form" onSubmit={this.handleSubmit}>
        <PageTitle />
        {errors.global && errors.global.length !== 0 && (
          <FieldErrors errors={errors.global} />
        )}
        <Section title={__('settings.interface.title')}><InterfaceSettings /></Section>
        <Section title={__('settings.message.title')}><MessageSettings /></Section>
        <Section title={__('settings.contact.title')}><ContactSettings /></Section>
        <Section title={__('settings.notification.title')}><NotificationSettings /></Section>
        <Section title={__('settings.desktop_notification.title')}><DesktopNotificationSettings /></Section>
        <Section>
          <Button type="submit" shape="plain">
            {__('settings.presentation.update.action')}
          </Button>
        </Section>
      </form>
    );
  }
}

export default ApplicationSettings;
