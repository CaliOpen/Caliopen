import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withI18n } from '@lingui/react';
import { Button, Spinner } from '../../../../components';
import TextFieldGroup from '../../../../components/TextFieldGroup';

import './style.scss';

function generateStateFromProps({ terms }) {
  return {
    terms,
  };
}

@withI18n()
class TagSearch extends Component {
  static propTypes = {
    terms: PropTypes.string,
    onSubmit: PropTypes.func.isRequired,
    onChange: PropTypes.func,
    i18n: PropTypes.shape({ _: PropTypes.func }).isRequired,
    isFetching: PropTypes.bool,
    errors: PropTypes.arrayOf(PropTypes.node),
  };

  static defaultProps = {
    terms: '',
    onChange: () => {
      // noop
    },
    isFetching: false,
    errors: [],
  };

  state = {
    terms: '',
  };

  UNSAFE_componentWillMount() {
    this.setState((prevState) => generateStateFromProps(this.props, prevState));
  }

  UNSAFE_componentWillReceiveProps(newProps) {
    this.setState((prevState) => generateStateFromProps(newProps, prevState));
  }

  handleChange = (ev) => {
    const terms = ev.target.value;
    this.setState({ terms });
    this.props.onChange(terms);
  };

  handleSubmit = () => {
    if (this.state.terms.length === 0) {
      return;
    }

    this.props.onSubmit(this.state.terms);
  };

  render() {
    const { i18n, isFetching, errors } = this.props;

    return (
      <div className="m-add-tag">
        <TextFieldGroup
          name="terms"
          value={this.state.terms}
          className="m-add-tag__input"
          label={i18n._('tags.form.add.label', null, { defaults: 'Add a tag' })}
          placeholder={i18n._('tags.form.add.placeholder', null, {
            defaults: 'New tag ...',
          })}
          onChange={this.handleChange}
          showLabelforSr
          errors={errors}
        />
        <Button
          className="m-add-tag__button"
          icon={isFetching ? <Spinner isLoading display="inline" /> : 'plus'}
          disabled={isFetching}
          shape="plain"
          onClick={this.handleSubmit}
          aria-label={i18n._('tags.action.add', null, { defaults: 'Add' })}
        />
      </div>
    );
  }
}

export default TagSearch;
