import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Trans } from '@lingui/react';
import Icon from '../../../Icon';
import Button from '../../../Button';
import './style.scss';

function generateStateFromProps(props) {
  const item =
    typeof props.defaultValue === 'string'
      ? props.defaultValue
      : { ...props.defaultValue };

  return { item };
}

class AddFieldGroup extends Component {
  static propTypes = {
    template: PropTypes.func.isRequired,
    // eslint-disable-next-line react/no-unused-prop-types
    defaultValue: PropTypes.oneOfType([PropTypes.string, PropTypes.shape({})]),
    onAdd: PropTypes.func.isRequired,
    validate: PropTypes.func,
  };

  static defaultProps = {
    defaultValue: '',
    validate: () => ({
      isValid: true,
    }),
  };

  constructor(props) {
    super(props);
    this.state = {
      errors: [],
    };
    this.handleAdd = this.handleAdd.bind(this);
    this.handleChange = this.handleChange.bind(this);
  }

  UNSAFE_componentWillMount() {
    this.setState(generateStateFromProps(this.props));
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    this.setState(generateStateFromProps(nextProps));
  }

  handleChange({ item }) {
    this.setState({ item });
  }

  handleAdd() {
    const validation = this.props.validate(this.state.item);

    if (validation.isValid) {
      this.props.onAdd({ item: this.state.item });
      this.setState({
        item: '',
        errors: [],
      });
    } else {
      this.setState({
        errors: validation.errors,
      });
    }
  }

  render() {
    const { template } = this.props;

    return (
      <div className="m-add-field-group">
        {template({
          item: this.state.item,
          onChange: this.handleChange,
          className: 'm-add-field-group__input',
          errors: this.state.errors,
        })}
        <Button
          shape="plain"
          className="m-add-field-group__button"
          onClick={this.handleAdd}
          disabled={this.state.item.length === 0}
        >
          <span className="show-for-sr">
            <Trans id="collection-field-group.action.add">Add</Trans>
          </span>
          <Icon type="plus" />
        </Button>
      </div>
    );
  }
}

export default AddFieldGroup;
