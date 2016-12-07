import React, { PropTypes, Component } from 'react';
import { withTranslator } from '@gandi/react-translate';
import Icon from '../../../Icon';
import Button from '../../../Button';
import { TextFieldGroup } from '../../../form';
import './style.scss';

class ContactProfileForm extends Component {
  constructor(props) {
    super(props);

    this.state = {
      contact: props.contact,
    };

    this.handleChanges = this.handleChanges.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleChanges(event) {
    this.setState({ contact: { ...this.state.contact, [event.target.name]: event.target.value } });
  }

  handleSubmit(event) {
    event.preventDefault();
    this.props.onChange(this.state.contact);
  }

  render() {
    const { __ } = this.props;

    return (
      <form
        className="m-contact-profile-form"
        onSubmit={this.handleSubmit}
      >
        <TextFieldGroup
          className="m-contact-profile-form__firstname"
          value={this.state.contact.given_name}
          label={__('contact_profile.form.firstname.label')}
          name="given_name"
          onChange={this.handleChanges}
        />
        <TextFieldGroup
          className="m-contact-profile-form__lastname"
          value={this.state.contact.family_name}
          label={__('contact_profile.form.lastname.label')}
          name="family_name"
          onChange={this.handleChanges}
        />
        <TextFieldGroup
          className="m-contact-profile-form__birthday"
          value={this.state.contact.birthday}
          label={__('contact_profile.form.birthday.label')}
          name="birthday"
          onChange={this.handleChanges}
          expanded={false}
        />
        <div className="m-contact-profile-form__save-button">
          <div className="m-contact-profile-form__save-button-wrapper">
            <Button type="submit" modifiers={{ expanded: true, plain: true }}>
              <Icon type="check" /> {__('contact_profile.action.save')}
            </Button>
          </div>
        </div>
      </form>
    );
  }
}

ContactProfileForm.propTypes = {
  contact: PropTypes.shape({}),
  onChange: PropTypes.func,
  __: PropTypes.func.isRequired,
};

export default withTranslator()(ContactProfileForm);
