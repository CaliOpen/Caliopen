import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Provider } from 'react-redux';
import Routes from './routes';
import I18nProvider from './components/I18nProvider';
import { initConfig } from './services/config';

// FIME PLZ

// eslint-disable-next-line react/prefer-stateless-function
class App extends Component {
  static propTypes = {
    store: PropTypes.shape({ dispatch: PropTypes.func.isRequired }).isRequired,
    config: PropTypes.shape({}),
  };

  static defaultProps = {
    config: {},
  };

  componentWillMount() {
    if (this.props.config) {
      initConfig(this.props.config);
    }
  }

  render() {
    const { store } = this.props;

    return (
      <Provider store={store}>
        <I18nProvider>
          <Routes />
        </I18nProvider>
      </Provider>
    );
  }
}

export default App;
