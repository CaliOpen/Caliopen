import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import Button from '../../../../components/Button';
import { FormGrid, FormRow, FormColumn, Fieldset, Legend, TextFieldGroup, SelectFieldGroup, CollectionFieldGroup } from '../../../../components/form';
import './style.scss';

function generateStateFromProps(props) {
  return {
    device: {
      name: '',
      type: '',
      locations: [],
      ...props.device,
    },
  };
}

class DeviceForm extends Component {
  static propTypes = {
    device: PropTypes.shape({}).isRequired,
    onChange: PropTypes.func.isRequired,
    __: PropTypes.func.isRequired,
  };

  constructor(props) {
    super(props);
    this.state = {
      ...generateStateFromProps(this.props),
    };
    this.handleFieldChange = this.handleFieldChange.bind(this);
    this.validateIP = this.validateIP.bind(this);
    this.handleLocationsChange = this.handleLocationsChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  componentWillMount() {
    this.setState(generateStateFromProps(this.props));
  }

  componentWillReceiveProps(newProps) {
    this.setState(generateStateFromProps(newProps));
  }

  handleFieldChange(ev) {
    const { name, value } = ev.target;
    this.setState(prevState => ({
      device: {
        ...prevState.device,
        [name]: value,
      },
    }));
  }

  handleLocationsChange(locations) {
    this.setState(prevState => ({
      device: {
        ...prevState.device,
        locations,
      },
    }));
  }

  validateIP(ip) {
    if (/^[0-9]{1,3}(\.[-/0-9]*){1,3}$/.test(ip)) {
      return { isValid: true };
    }

    const { __ } = this.props;

    return { isValid: false, errors: [__('device.feedback.invalid_ip')] };
  }

  handleSubmit(event) {
    event.preventDefault();
    this.props.onChange({ device: this.state.device, original: this.props.device });
  }

  render() {
    const { __ } = this.props;
    const deviceTypes = [
      { value: 'desktop', label: __('device.type.desktop') },
      { value: 'laptop', label: __('device.type.laptop') },
      { value: 'smartphone', label: __('device.type.smartphone') },
      { value: 'tablet', label: __('device.type.tablet') },
    ];
    const locationTypes = [
      { label: __('device.location.type.unknown'), value: 'unknown' },
      { label: __('device.location.type.home'), value: 'home' },
      { label: __('device.location.type.work'), value: 'work' },
      { label: __('device.location.type.public'), value: 'public' },
    ];
    const defaultLocation = { address: '', type: locationTypes[0].value };

    const locationTemplate = ({ item: location, onChange, className }) => {
      const handleChange = (ev) => {
        const { name, value } = ev.target;
        onChange({
          item: {
            ...location,
            [name]: value,
          },
        });
      };

      return (
        <div className={classnames('m-device-form__location-group', className)}>
          <TextFieldGroup
            showLabelforSr
            name="address"
            label={__('device.form.locations.address.label')}
            value={location.address}
            onChange={handleChange}
            className="m-device-form__location-address"
          />
          <SelectFieldGroup
            showLabelforSr
            name="type"
            label={__('device.form.locations.type.label')}
            value={location.type}
            options={locationTypes}
            onChange={handleChange}
            className="m-device-form__location-type"
          />
        </div>
      );
    };

    return (
      <FormGrid className="m-device-form">
        <form method="post" onSubmit={this.handleSubmit}>
          <Fieldset className="m-device-form__fieldset">
            <Legend>{__('device.manage_form.name.label')}</Legend>
            <FormRow reverse>
              <FormColumn bottomSpace size="medium">
                <label htmlFor="device-name">{__('device.manage_form.name.infotext')}</label>
              </FormColumn>
              <FormColumn bottomSpace size="medium">
                <TextFieldGroup
                  label={__('device.manage_form.name.label')}
                  name="name"
                  id="device-name"
                  showLabelforSr
                  value={this.state.device.name}
                  onChange={this.handleFieldChange}
                />
              </FormColumn>
            </FormRow>
          </Fieldset>
          <Fieldset className="m-device-form__fieldset">
            <Legend>{__('device.manage_form.type.label')}</Legend>
            <FormRow reverse>
              <FormColumn bottomSpace size="medium">
                <label htmlFor="device-type">{__('device.manage_form.type.infotext')}</label>
              </FormColumn>
              <FormColumn size="medium">
                <SelectFieldGroup
                  className="m-device-form__type"
                  label={__('device.manage_form.type.label')}
                  name="type"
                  id="device-type"
                  showLabelforSr
                  value={this.state.device.type}
                  options={deviceTypes}
                  onChange={this.handleFieldChange}
                />
              </FormColumn>
            </FormRow>
          </Fieldset>
          <Fieldset className="m-device-form__fieldset">
            <Legend>{__('device.manage_form.ips.label')}</Legend>
            <FormRow reverse>
              <FormColumn bottomSpace size="medium">
                <label htmlFor="device-ips">{__('device.manage_form.ips.infotext')}</label>
              </FormColumn>
              <FormColumn bottomSpace size="medium">
                <CollectionFieldGroup
                  defaultValue={defaultLocation}
                  collection={this.state.device.locations}
                  addTemplate={locationTemplate}
                  editTemplate={locationTemplate}
                  onChange={this.handleLocationsChange}
                />
              </FormColumn>
            </FormRow>
          </Fieldset>
          <FormRow>
            <FormColumn size="medium">
              <Button plain type="submit">{__('device.action.save_changes')}</Button>
            </FormColumn>
          </FormRow>
        </form>
      </FormGrid>
    );
  }
}

export default DeviceForm;
