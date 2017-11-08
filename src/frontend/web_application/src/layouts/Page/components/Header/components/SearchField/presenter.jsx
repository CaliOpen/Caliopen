import React, { Component } from 'react';
import PropTypes from 'prop-types';
import './style.scss';
import { InputText } from '../../../../../../components/form';
import Icon from '../../../../../../components/Icon';
import { RawButton } from '../../../../../../components/Button';

const generateStateFromProps = ({ term }) => ({ term });

const SEARCH_PATH = '/search-results';

class SearchField extends Component {
  static propTypes = {
    term: PropTypes.string,
    push: PropTypes.func.isRequired,
    __: PropTypes.func.isRequired,
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
    const { __ } = this.props;

    return (
      <div className="m-search-field">
        <form action="/search-results" method="get" onSubmit={this.handleSubmit}>
          <InputText
            name="term"
            onChange={this.handleInputChange}
            value={this.state.term}
            placeholder={__('header.menu.search')}
            className="m-search-field__input m-input-text"
          />
          <RawButton
            className="m-search-field__button"
            type="submit"
            aria-label={__('header.menu.search')}
          ><Icon type="search" /></RawButton>
        </form>
      </div>
    );
  }
}

export default SearchField;
