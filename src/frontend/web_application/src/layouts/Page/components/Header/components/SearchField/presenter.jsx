import React, { Component } from 'react';
import PropTypes from 'prop-types';
import './style.scss';
import { Icon, InputText } from '../../../../../../components/';
import RawButton from '../../../../../../components/RawButton';

const generateStateFromProps = ({ term }) => ({ term });

const SEARCH_PATH = '/search-results';
const MIN_TERM_LENGTH = 3;

class SearchField extends Component {
  static propTypes = {
    term: PropTypes.string,
    push: PropTypes.func.isRequired,
    i18n: PropTypes.shape({}).isRequired,
  };
  static defaultProps = {
    term: '',
  };
  state = {
    term: '',
  };

  componentWillMount() {
    this.setState(generateStateFromProps(this.props));
  }

  componentWillReceiveProps(nextProps) {
    this.setState(generateStateFromProps(nextProps));
  }

  handleSubmit = (ev) => {
    ev.preventDefault();
    const { push } = this.props;
    const { term } = this.state;
    push(`${SEARCH_PATH}?term=${term}`);
  }

  handleInputChange = (event) => {
    const { target } = event;
    const { name, type } = target;
    const value = type === 'checkbox' ? target.checked : target.value;

    this.setState({
      [name]: value,
    });
  }

  render() {
    const { i18n } = this.props;

    return (
      <div className="m-search-field">
        <form action="/search-results" method="get" onSubmit={this.handleSubmit}>
          <InputText
            name="term"
            onChange={this.handleInputChange}
            value={this.state.term}
            theme="dark"
            placeholder={i18n._('header.menu.search', { defaults: 'Search' })}
            className="m-search-field__input"
          />
          <RawButton
            className="m-search-field__button"
            type="submit"
            aria-label={i18n._('header.menu.search', { defaults: 'Search' })}
            disabled={this.state.term.length < MIN_TERM_LENGTH}
          >
            <Icon type="search" />
          </RawButton>
        </form>
      </div>
    );
  }
}

export default SearchField;
