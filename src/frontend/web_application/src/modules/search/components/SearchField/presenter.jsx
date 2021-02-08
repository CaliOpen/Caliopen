import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import { Trans, withI18n } from '@lingui/react';
import { withRouter } from 'react-router-dom';
import { Icon, InputText, Button } from '../../../../components';
import { withSearchParams } from '../../../routing';
import './style.scss';

const SEARCH_PATH = '/search-results';
const MIN_TERM_LENGTH = 3;

@withI18n()
@withRouter
@withSearchParams()
class SearchField extends Component {
  static propTypes = {
    className: PropTypes.string,
    history: PropTypes.shape({
      push: PropTypes.func.isRequired,
    }).isRequired,
    searchParams: PropTypes.shape({
      term: PropTypes.string,
    }).isRequired,
    i18n: PropTypes.shape({ _: PropTypes.func }).isRequired,
  };

  static defaultProps = {
    className: '',
  };

  state = {
    term: '',
  };

  UNSAFE_componentWillMount() {
    const {
      searchParams: { term = '' },
    } = this.props;

    this.setState({
      term,
    });
  }

  handleSubmit = (ev) => {
    ev.preventDefault();
    const {
      history: { push },
    } = this.props;
    push(`${SEARCH_PATH}?term=${this.state.term}`);
  };

  handleInputChange = (event) => {
    const { target } = event;
    const { name, type } = target;
    const value = type === 'checkbox' ? target.checked : target.value;

    this.setState({
      [name]: value,
    });
  };

  render() {
    const { i18n, className } = this.props;

    return (
      <div className={classnames('m-search-field', className)}>
        <form
          action="/search-results"
          method="get"
          onSubmit={this.handleSubmit}
        >
          <InputText
            name="term"
            onChange={this.handleInputChange}
            value={this.state.term}
            placeholder={i18n._('header.menu.search', null, {
              defaults: 'Search',
            })}
            className="m-search-field__search-input"
          />
          <Button
            className="m-search-field__search-button"
            type="submit"
            shape="plain"
            disabled={this.state.term.length < MIN_TERM_LENGTH}
          >
            <span className="m-search-field__button-label">
              <Trans id="header.actions.search">Search</Trans>
            </span>
            <Icon type="search" />
          </Button>
        </form>
      </div>
    );
  }
}

export default SearchField;
