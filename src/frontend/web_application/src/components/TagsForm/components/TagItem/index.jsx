import React, { Component, PropTypes } from 'react';
import Button from '../../../Button';
import Icon from '../../../Icon';
import { TextFieldGroup, FormGrid } from '../../../form';

import './style.scss';

function generateStateFromProps(props) {
  return { tag: { ...props.tag } };
}


class TagItem extends Component {
  static propTypes = {
    tag: PropTypes.shape({ type: PropTypes.string }).isRequired,
    onUpdate: PropTypes.func.isRequired,
  };

  constructor(props) {
    super(props);
    this.state = {
      tag: { name: '' },
      edit: false,
    };

    this.handleClickTag = this.handleClickTag.bind(this);
    this.handleUpdate = this.handleUpdate.bind(this);
    this.handleChange = this.handleChange.bind(this);
  }

  componentWillMount() {
    this.setState(generateStateFromProps(this.props));
  }

  componentWillReceiveProps(newProps) {
    this.setState(generateStateFromProps(newProps));
  }

  handleClickTag() {
    this.setState(prevState => ({
      edit: !prevState.edit,
    }));
  }

  handleChange(ev) {
    const name = ev.target.value;

    this.setState(prevState => ({
      tag: { ...prevState.tag, name },
    }));
  }

  handleUpdate() {
    this.setState((prevState) => {
      this.props.onUpdate({ tag: this.state.tag, original: this.props.tag });

      return {
        tag: { ...prevState.tag, name },
      };
    });
  }

  renderForm() {
    const { tag } = this.props;

    return (
      <FormGrid className="m-tag">
        <TextFieldGroup
          name={tag.tag_id}
          className="m-tag__input"
          label={tag.name}
          placeholder={tag.name}
          value={this.state.tag.name}
          onChange={this.handleChange}
          showLabelforSr
          autoFocus
        />
        <Button inline onClick={this.handleUpdate}><Icon type="check" /></Button>
      </FormGrid>
    );
  }

  renderButton() {
    const { tag } = this.props;

    return (
      <FormGrid className="m-tag">
        <Button
          className="m-tag__button"
          onClick={this.handleClickTag}
          expanded
        >
          <span className="m-tag__text">{tag.name}</span>
          <Icon className="m-tag__icon" type="edit" />
        </Button>
      </FormGrid>
    );
  }

  renderSystem() {
    const { tag } = this.props;

    return (
      <div className="m-tag">
        <span className="m-tag__text">{tag.name}</span>
      </div>
    );
  }

  render() {
    if (this.state.edit) {
      return this.renderForm();
    }

    if (this.props.tag.type === 'system') {
      return this.renderSystem();
    }

    return this.renderButton();
  }
}

export default TagItem;
