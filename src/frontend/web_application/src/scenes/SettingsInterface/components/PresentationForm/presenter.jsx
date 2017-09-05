import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Button from '../../../../components/Button';
import { FormGrid, FormRow, FormColumn, SelectFieldGroup, FieldErrors, CheckboxFieldGroup } from '../../../../components/form';

const DISPLAY_PREVIEW = ['1 line', '2 lines', 'Bla'];

function generateStateFromProps(props, prevState) {
  return {
    settings: {
      ...prevState.settings,
      ...props.settings,
    },
  };
}

class PresentationForm extends Component {
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
      show_avatar_inbox: false,
      show_unread_msg_bolder: false,
      show_recent_msg_on_top: false,
      show_msg_in_conversation: false,
      display_preview_inbox: undefined,
    },
  };

  componentWillMount() {
    this.setState(prevState => generateStateFromProps(this.props, prevState));
  }

  componentWillReceiveProps(newProps) {
    this.setState(prevState => generateStateFromProps(newProps, prevState));
  }

  getOptionsFromArray = (options) => {
    const selectedOptions = options.map(value => ({
      value,
      label: value,
    }));

    return selectedOptions;
  }

  handleSubmit = () => {
    const { settings } = this.state;
    this.props.onSubmit({ settings });
  }

  handleCheckboxChange = (event) => {
    const { name, checked } = event.target;
    this.setState(prevState => ({
      settings: {
        ...prevState.settings,
        [name]: checked,
      },
    }));
  }

  handleSelectChange = (event) => {
    const { name, value } = event.target;
    this.setState(prevState => ({
      settings: {
        ...prevState.settings,
        [name]: value,
      },
    }));
  }

  render() {
    const { errors, __ } = this.props;

    const displayPreviewOptions = this.getOptionsFromArray(DISPLAY_PREVIEW);

    return (
      <FormGrid className="m-presentation-form">
        <form method="post" name="presentation_form">
          {errors.global && errors.global.length !== 0 && (
          <FormRow>
            <FormColumn bottomSpace>
              <FieldErrors errors={errors.global} />
            </FormColumn>
          </FormRow>
          )}
          <FormRow>
            <FormColumn size="shrink" bottomSpace >
              <CheckboxFieldGroup
                name="show_avatar_inbox"
                onChange={this.handleCheckboxChange}
                label={__('settings.presentation.show_avatar_inbox.label')}
                checked={this.state.settings.show_avatar_inbox}
                showTextLabel
              />
            </FormColumn>
          </FormRow>
          <FormRow>
            <FormColumn size="shrink" bottomSpace >
              <CheckboxFieldGroup
                name="show_unread_msg_bolder"
                onChange={this.handleCheckboxChange}
                label={__('settings.presentation.show_unread_msg_bolder.label')}
                checked={this.state.settings.show_unread_msg_bolder}
                showTextLabel
              />
            </FormColumn>
          </FormRow>
          <FormRow>
            <FormColumn size="shrink" bottomSpace >
              <CheckboxFieldGroup
                name="show_recent_msg_on_top"
                onChange={this.handleCheckboxChange}
                label={__('settings.presentation.show_recent_msg_on_top.label')}
                checked={this.state.settings.show_recent_msg_on_top}
                showTextLabel
              />
            </FormColumn>
          </FormRow>
          <FormRow>
            <FormColumn size="shrink" bottomSpace >
              <CheckboxFieldGroup
                name="show_msg_in_conversation"
                onChange={this.handleCheckboxChange}
                label={__('settings.presentation.show_msg_in_conversation.label')}
                checked={this.state.settings.show_msg_in_conversation}
                showTextLabel
              />
            </FormColumn>
          </FormRow>
          <FormRow>
            <FormColumn size="shrink" bottomSpace >
              <SelectFieldGroup
                name="display_preview_inbox"
                value={this.state.settings.display_preview_inbox}
                onChange={this.handleCheckboxChange}
                label={__('settings.presentation.display.label')}
                options={displayPreviewOptions}
              />
            </FormColumn>
          </FormRow>
          <FormRow>
            <FormColumn size="shrink" className="m-presentation-form__action" bottomSpace>
              <Button
                type="submit"
                onClick={this.handleSubmit}
                shape="plain"
              >{__('settings.presentation.update.action')}</Button>
            </FormColumn>
          </FormRow>
        </form>
      </FormGrid>
    );
  }
}

export default PresentationForm;
