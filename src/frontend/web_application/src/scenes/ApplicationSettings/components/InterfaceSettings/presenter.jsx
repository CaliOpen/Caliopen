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
import { AVAILABLE_LOCALES } from '../../../../modules/i18n';

const languages = {
  fr_FR: 'Français',
  en_US: 'English',
  de_DE: 'Deutsch',
};
const SelectFieldGroup = renderReduxField(SelectFieldGroupBase);

class InterfaceSettings extends PureComponent {
  static propTypes = {
    i18n: PropTypes.shape({ _: PropTypes.func }).isRequired,
  };

  getOptionsFromArray = (options) =>
    options.map((value) => ({
      value,
      label: languages[value] || value,
    }));

  render() {
    const { i18n } = this.props;
    const languageOptions = this.getOptionsFromArray(AVAILABLE_LOCALES);

    return (
      <FormGrid className="m-interface-form">
        <FormRow>
          <FormColumn rightSpace={false}>
            <Field
              component={SelectFieldGroup}
              name="default_locale"
              label={i18n._(
                /* i18n */ 'settings.interface.language.label',
                null,
                {
                  message: 'Language',
                }
              )}
              options={languageOptions}
              expanded
            />
          </FormColumn>
        </FormRow>
      </FormGrid>
    );
  }
}

export default InterfaceSettings;
