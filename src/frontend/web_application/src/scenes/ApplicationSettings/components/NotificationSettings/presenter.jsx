import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Field } from 'redux-form';
import {
  CheckboxFieldGroup as CheckboxFieldGroupBase,
  SelectFieldGroup as SelectFieldGroupBase,
  FormGrid,
  FormRow,
  FormColumn,
} from '../../../../components';
import renderReduxField from '../../../../services/renderReduxField';

const SelectFieldGroup = renderReduxField(SelectFieldGroupBase);
const CheckboxFieldGroup = renderReduxField(CheckboxFieldGroupBase);

const MESSAGE_PREVIEW = ['off', 'always'];
const DELAY_DISAPPEAR = [0, 5, 10, 30];

class NotificationForm extends Component {
  static propTypes = {
    i18n: PropTypes.shape({ _: PropTypes.func }).isRequired,
  };

  static defaultProps = {};

  UNSAFE_componentWillMount() {
    this.initTranslations();
  }

  getOptionsFromArray = (options) =>
    options.map((value) => ({
      value,
      label: this.i18n[value] || value,
    }));

  initTranslations() {
    const { i18n } = this.props;
    this.i18n = {
      off: i18n._('settings.notification.message_preview.options.off', null, {
        defaults: 'Off',
      }),
      always: i18n._(
        'settings.notification.message_preview.options.always',
        null,
        { defaults: 'Always' }
      ),
    };
  }

  render() {
    const { i18n } = this.props;

    const messagePreviewOptions = this.getOptionsFromArray(MESSAGE_PREVIEW);
    const delayDisappearOptions = DELAY_DISAPPEAR.map((delay) => ({
      value: delay,
      label: i18n._(
        'settings.notification.delay_disappear.options.second',
        { 0: delay },
        { defaults: '{0} Seconds' }
      ),
    }));

    return (
      <FormGrid className="m-contacts-form">
        <FormRow>
          <FormColumn rightSpace={false} bottomSpace>
            <Field
              component={CheckboxFieldGroup}
              type="checkbox"
              name="notification_enabled"
              label={i18n._('settings.notification.enabled.label', null, {
                defaults: 'Enabled',
              })}
            />
          </FormColumn>
          <FormColumn rightSpace={false} bottomSpace>
            <Field
              component={CheckboxFieldGroup}
              type="checkbox"
              name="notification_sound_enabled"
              label={i18n._('settings.notification.sound_enabled.label', null, {
                defaults: 'Sound enabled',
              })}
            />
          </FormColumn>
          <FormColumn rightSpace={false} bottomSpace>
            <Field
              component={SelectFieldGroup}
              name="notification_message_preview"
              label={i18n._(
                'settings.notification.message_preview.label',
                null,
                { defaults: 'Message preview' }
              )}
              options={messagePreviewOptions}
              expanded
            />
          </FormColumn>
          <FormColumn rightSpace={false}>
            <Field
              component={SelectFieldGroup}
              name="notification_delay_disappear"
              label={i18n._(
                'settings.notification.delay_disappear.label',
                null,
                { defaults: 'Display delay' }
              )}
              options={delayDisappearOptions}
              expanded
            />
          </FormColumn>
        </FormRow>
      </FormGrid>
    );
  }
}

export default NotificationForm;
