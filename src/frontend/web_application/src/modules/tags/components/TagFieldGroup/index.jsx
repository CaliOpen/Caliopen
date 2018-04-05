import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withI18n } from 'lingui-react';
import classnames from 'classnames';
import { TextFieldGroup, Button, Spinner } from '../../../../components';

import './style.scss';

function generateStateFromProps({ terms }) {
  return {
    terms,
  };
}

@withI18n()
class TagFieldGroup extends Component {
  static propTypes = {
    terms: PropTypes.string,
    onSubmit: PropTypes.func.isRequired,
    input: PropTypes.shape({}),
    i18n: PropTypes.shape({}).isRequired,
    isFetching: PropTypes.bool,
    errors: PropTypes.arrayOf(PropTypes.node),
  };

  static defaultProps = {
    terms: '',
    input: {},
    isFetching: false,
    errors: [],
  };

  state = {
    terms: '',
  };

  componentWillMount() {
    this.setState(prevState => generateStateFromProps(this.props, prevState));
  }

  componentWillReceiveProps(newProps) {
    this.setState(prevState => generateStateFromProps(newProps, prevState));
  }

  handleChange = (ev) => {
    const { input: { onChange = () => {} } } = this.props;
    const terms = ev.target.value;
    this.setState({ terms });
    onChange(terms);
  }

  handleSubmit = () => {
    if (this.state.terms.length === 0) {
      return;
    }

    this.props.onSubmit(this.state.terms);
  }

  render() {
    const {
      i18n, isFetching, errors, input,
    } = this.props;

    const inputProps = {
      ...input,
      className: classnames(input.className, 'm-tags-search__input'),
      label: i18n._('tags.form.search.label', { defaults: 'Search' }),
      placeholder: i18n._('tags.form.search.placeholder', { defaults: 'Search a tag ...' }),
      onChange: this.handleChange,
      showLabelforSr: true,
      errors,
    };

    return (
      <div className="m-tags-search">
        <TextFieldGroup
          {...inputProps}
          name="terms"
          value={this.state.terms}
        />
        <Button
          className="m-tags-search__button"
          icon={isFetching ? (<Spinner isLoading display="inline" />) : 'plus'}
          disabled={isFetching}
          onClick={this.handleSubmit}
          aria-label={i18n._('tags.action.add', { defaults: 'Add' })}
        />
      </div>
    );
  }
}

export default TagFieldGroup;
