import { Component } from 'react';
import PropTypes from 'prop-types';

class WithContacts extends Component {
  static propTypes = {
    render: PropTypes.func.isRequired,
    contacts: PropTypes.arrayOf(PropTypes.shape({})),
    isFetching: PropTypes.bool,
    didInvalidate: PropTypes.bool,
    requestContacts: PropTypes.func.isRequired,
  };

  static defaultProps = {
    contacts: [],
    isFetching: false,
    didInvalidate: false,
  };

  state = {};

  componentDidMount() {
    const { isFetching, contacts, requestContacts, didInvalidate } = this.props;

    if (!isFetching && (contacts.length === 0 || didInvalidate)) {
      requestContacts();
    }
  }

  render() {
    const { render, contacts } = this.props;

    return render({ contacts });
  }
}

export default WithContacts;
