import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

const renderReduxField = (WrappedComponent) => {
  // TODO: use same api in caliopen form fields as redux-form
  class ReduxField extends PureComponent {
    static propTypes = {
      input: PropTypes.shape({}).isRequired,
    };

    static defaultProps = {};

    render() {
      // extract unused props to prevent "Warning: Unknown prop"
      // eslint-disable-next-line react/prop-types
      const { input, meta, ...props } = this.props;

      // eslint-disable-next-line react/prop-types
      const errors = meta.error ? [meta.error] : [];

      return <WrappedComponent {...input} errors={errors} {...props} />;
    }
  }

  return ReduxField;
};

export default renderReduxField;
