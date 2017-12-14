import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Field } from 'redux-form';
import { FormGrid, FormRow, FormColumn, SelectFieldGroup as SelectFieldGroupBase } from '../../../../components/form';
import renderReduxField from '../../../../services/renderReduxField';

const SelectFieldGroup = renderReduxField(SelectFieldGroupBase);

const LANGUAGES = ['fr_FR', 'en_EN', 'de_DE'];

class InterfaceSettings extends PureComponent {
  static propTypes = {
    __: PropTypes.func.isRequired,
  };

  componentWillMount() {
    this.initTranslations();
  }

  getOptionsFromArray = options => options.map(value => ({
    value,
    label: this.i18n[value] || value,
  }));

  initTranslations() {
    const { __ } = this.props;
    this.i18n = {
      fr_FR: __('settings.interface.language.options.fr'),
      en_EN: __('settings.interface.language.options.en'),
      de_DE: __('settings.interface.language.options.de'),
    };
  }

  render() {
    const { __ } = this.props;
    const languageOptions = this.getOptionsFromArray(LANGUAGES);

    return (
      <FormGrid className="m-interface-form">
        <FormRow>
          <FormColumn size="shrink" bottomSpace >
            <Field
              component={SelectFieldGroup}
              name="default_locale"
              label={__('settings.interface.language.label')}
              options={languageOptions}
            />
          </FormColumn>
        </FormRow>
      </FormGrid>
    );
  }
}

export default InterfaceSettings;
