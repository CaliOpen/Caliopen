import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { getTagLabel } from '../../../../modules/tags';
import {
  Button,
  Icon,
  Spinner,
  FormGrid,
  FieldErrors,
  TextFieldGroup,
} from '../../../../components';
import './style.scss';

const TAG_TYPE_USER = 'user';

function generateStateFromProps(props) {
  return {
    tag: {
      ...props.tag,
      label: props.tag.label || getTagLabel(props.i18n, props.tag),
    },
  };
}

class TagInput extends Component {
  static propTypes = {
    i18n: PropTypes.shape({ _: PropTypes.func }).isRequired,
    tag: PropTypes.shape({}).isRequired,
    onUpdateTag: PropTypes.func.isRequired,
    onDeleteTag: PropTypes.func.isRequired,
    errors: PropTypes.arrayOf(PropTypes.node),
  };

  static defaultProps = {
    errors: [],
  };

  state = {
    tag: {},
    edit: false,
    isFetching: false,
  };

  UNSAFE_componentWillMount() {
    this.setState(generateStateFromProps(this.props));
  }

  UNSAFE_componentWillReceiveProps(newProps) {
    this.setState(generateStateFromProps(newProps));
  }

  handleChange = (ev) => {
    const label = ev.target.value;

    this.setState((prevState) => ({
      tag: { ...prevState.tag, label },
    }));
  };

  handleClickTag = () => {
    this.setState((prevState) => ({
      edit: !prevState.edit,
    }));
  };

  handleUpdateTag = async () => {
    const { onUpdateTag, tag: original } = this.props;
    this.setState({ isFetching: true });
    await onUpdateTag({ original, tag: this.state.tag });
    this.setState({ isFetching: false, edit: false });
  };

  handleDeleteTag = async () => {
    const { onDeleteTag, tag } = this.props;
    this.setState({ isFetching: true });
    await onDeleteTag({ tag });
    this.setState({ isFetching: false });
  };

  renderForm() {
    const { tag, errors, i18n } = this.props;

    return (
      <FormGrid className="m-tag-input">
        <TextFieldGroup
          name={tag.name}
          className="m-tag-input__input"
          label={tag.name}
          placeholder={getTagLabel(i18n, tag)}
          value={this.state.tag.label}
          onChange={this.handleChange}
          showLabelforSr
          autoFocus
          errors={errors}
        />
        <Button
          onClick={this.handleUpdateTag}
          aria-label={i18n._('settings.tag.action.save-tag', null, {
            defaults: 'Save',
          })}
          icon={
            this.state.isFetching ? (
              <Spinner isLoading display="inline" />
            ) : (
              'check'
            )
          }
          disabled={this.state.isFetching}
        />
      </FormGrid>
    );
  }

  renderButton() {
    const { errors, tag, i18n } = this.props;

    return (
      <FormGrid className="m-tag-input">
        <Button className="m-tag-input__button" onClick={this.handleClickTag}>
          <span className="m-tag-input__text">{getTagLabel(i18n, tag)}</span>
          <Icon className="m-tag-input__icon" type="edit" spaced />
        </Button>
        {tag.type === TAG_TYPE_USER && (
          <Button
            className="m-tag-input__delete"
            aria-label={i18n._('settings.tags.action.delete', null, {
              defaults: 'Delete',
            })}
            disabled={this.state.isFetching}
            onClick={this.handleDeleteTag}
            icon={
              this.state.isFetching ? (
                <Spinner isLoading display="inline" />
              ) : (
                'remove'
              )
            }
          />
        )}
        {errors && (
          <FieldErrors errors={errors} className="m-tag-input__errors" />
        )}
      </FormGrid>
    );
  }

  render() {
    if (this.state.edit) {
      return this.renderForm();
    }

    return this.renderButton();
  }
}

export default TagInput;
