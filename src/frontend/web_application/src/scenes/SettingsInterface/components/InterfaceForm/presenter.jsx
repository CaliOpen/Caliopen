import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Button from '../../../../components/Button';
import { FormGrid, FormRow, FormColumn, SelectFieldGroup, FieldErrors } from '../../../../components/form';

// FIXME: i18n the following:
const LANGUAGES = ['Français', 'English'];
const TIME_ZONES = ['Automatic', 'Timezone 1', 'Timezone 2'];
const DATE_FORMATS = ['DD/MM/YYYY', 'MM/DD/YYYY'];
const TIME_FORMATS = ['12h', '24h'];
const REFRESH = ['Every 1 minute', 'Every 5 minutes', 'Every 10 minutes', 'Every 30 minutes'];

function generateStateFromProps(props, prevState) {
  return {
    settings: {
      ...prevState.settings,
      ...props.settings,
    },
  };
}

class InterfaceForm extends Component {
  static propTypes = {
    errors: PropTypes.shape({}),
    onSubmit: PropTypes.func.isRequired,
    __: PropTypes.func.isRequired,
  };
  static defaultProps = {
    errors: {},
  };

  state = {
    settings: {
      language: undefined,
      time_zone: undefined,
      date_format: undefined,
      time_format: undefined,
      refresh: undefined,
    },
  };

  componentWillMount() {
    this.setState(prevState => generateStateFromProps(this.props, prevState));
  }

  componentWillReceiveProps(newProps) {
    this.setState(prevState => generateStateFromProps(newProps, prevState));
  }

  getOptionsFromArray = (options, setting) => {
    const selectedOptions = options.map(value => ({
      value,
      label: value,
      selected: setting === value && setting !== null && true,
    }));

    return selectedOptions;
  }

  handleSubmit = () => {
    const { settings } = this.state;
    this.props.onSubmit({ settings });
  }

  handleInputChange = (ev) => {
    const { name, value } = ev.target;

    this.setState(prevState => ({
      settings: {
        ...prevState.settings,
        [name]: value,
      },
    }));
  }

  render() {
    const { errors, __ } = this.props;
    const { settings } = this.state;

    const languageOptions = this.getOptionsFromArray(LANGUAGES, settings.language);
    const timeZoneOptions = this.getOptionsFromArray(TIME_ZONES, settings.time_zone);
    const dateFormatOptions = this.getOptionsFromArray(DATE_FORMATS, settings.date_format);
    const timeFormatOptions = this.getOptionsFromArray(TIME_FORMATS, settings.time_format);
    const refreshOptions = this.getOptionsFromArray(REFRESH, settings.refresh);


    return (
      <FormGrid className="m-interface-form">
        <form method="post" name="interface_form">
          {errors.global && errors.global.length !== 0 && (
          <FormRow>
            <FormColumn bottomSpace>
              <FieldErrors errors={errors.global} />
            </FormColumn>
          </FormRow>
          )}
          <FormRow>
            <FormColumn size="shrink" bottomSpace >
              <SelectFieldGroup
                name="language"
                value={settings.language}
                onChange={this.handleInputChange}
                label={__('settings.interface.language.label')}
                options={languageOptions}
              />
            </FormColumn>
          </FormRow>
          <FormRow>
            <FormColumn size="shrink" bottomSpace >
              <SelectFieldGroup
                name="time_zone"
                value={settings.time_zone}
                onChange={this.handleInputChange}
                label={__('settings.interface.time_zone.label')}
                options={timeZoneOptions}
              />
            </FormColumn>
          </FormRow>
          <FormRow>
            <FormColumn size="shrink" bottomSpace>
              <SelectFieldGroup
                name="date_format"
                value={settings.date_format}
                onChange={this.handleInputChange}
                label={__('settings.interface.date_format.label')}
                options={dateFormatOptions}
              />
            </FormColumn>
            <FormColumn size="shrink" bottomSpace>
              <SelectFieldGroup
                name="time_format"
                value={settings.time_format}
                onChange={this.handleInputChange}
                label={__('settings.interface.time_format.label')}
                options={timeFormatOptions}
              />
            </FormColumn>
          </FormRow>
          <FormRow>
            <FormColumn size="shrink" bottomSpace >
              <SelectFieldGroup
                name="refresh"
                value={settings.refresh}
                onChange={this.handleInputChange}
                label={__('settings.interface.refresh.label')}
                options={refreshOptions}
              />
            </FormColumn>
          </FormRow>
          <FormRow>
            <FormColumn size="shrink" className="m-interface-form__action" bottomSpace>
              <Button
                type="submit"
                onClick={this.handleSubmit}
                shape="plain"
              >{__('settings.interface.update.action')}</Button>
            </FormColumn>
          </FormRow>
        </form>
      </FormGrid>
    );
  }
}

export default InterfaceForm;
