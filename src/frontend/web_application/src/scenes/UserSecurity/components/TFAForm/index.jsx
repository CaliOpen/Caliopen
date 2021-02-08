import React, { Component } from 'react';
// import PropTypes from 'prop-types';

class TFAForm extends Component {
  static propTypes = {
    // i18n: PropTypes.shape({ _: PropTypes.func }).isRequired,
    // requestUser: PropTypes.func.isRequired,
  };

  static defaultProps = {};

  componentDidMount() {
    // this.props.requestUser();
  }

  render() {
    return <div className="m-tfa-form" />;
  }
}

export default TFAForm;
