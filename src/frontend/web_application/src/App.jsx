import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Provider } from 'react-redux';
import { I18nLoader } from './modules/i18n';
import { WithSettings } from './modules/settings';
import { DeviceProvider } from './modules/device';
import { PageTitle } from './components/';
import Routes from './routes';
import I18nProviderLegacy from './components/I18nProvider';
import { initConfig } from './services/config';
import { NotificationProvider } from './modules/notification';
import './app.scss';

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
        <WithSettings render={({ default_locale: locale }) => (
          <I18nProviderLegacy>
            <I18nLoader locale={locale}>
              <PageTitle />
              <DeviceProvider>
                <Routes />
              </DeviceProvider>
              <NotificationProvider />
            </I18nLoader>
          </I18nProviderLegacy>
        )}
        />
      </Provider>
    );
  }
}

export default App;
