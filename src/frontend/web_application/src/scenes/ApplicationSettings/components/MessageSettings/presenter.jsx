import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Field } from 'redux-form';
import {
  SelectFieldGroup as SelectFieldGroupBase,
  FormGrid,
  FormRow,
  FormColumn,
} from '../../../../components';
import renderReduxField from '../../../../services/renderReduxField';

const SelectFieldGroup = renderReduxField(SelectFieldGroupBase);

const DISPLAY_FORMATS = ['rich_text', 'plain_text'];

class PresentationForm extends PureComponent {
  static propTypes = {
    i18n: PropTypes.shape({ _: PropTypes.func }).isRequired,
  };

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
      rich_text: i18n._(
        'settings.message.display_format.options.rich_text',
        null,
        { defaults: 'Rich text' }
      ),
      plain_text: i18n._(
        'settings.message.display_format.options.plain_text',
        null,
        { defaults: 'Plain text' }
      ),
    };
  }

  render() {
    const { i18n } = this.props;

    const displayFormatOptions = this.getOptionsFromArray(DISPLAY_FORMATS);

    return (
      <FormGrid className="m-settings-message-form">
        <FormRow>
          <FormColumn rightSpace={false}>
            <Field
              component={SelectFieldGroup}
              name="message_display_format"
              label={i18n._('settings.message.display_format.label', null, {
                defaults: 'Display',
              })}
              options={displayFormatOptions}
              expanded
            />
          </FormColumn>
        </FormRow>
      </FormGrid>
    );
  }
}

export default PresentationForm;
