import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Provider } from 'react-redux';
import { I18nLoader } from './modules/i18n';
import { WithSettings } from './modules/settings';
import { DeviceProvider } from './modules/device';
import { InstallPromptProvider } from './modules/pwa';
import { SwitchWithRoutes, RoutingConsumer } from './modules/routing';
import RoutingProvider from './modules/routing/components/RoutingProvider';
import { PageTitle } from './components';
import { initConfig } from './services/config';
import { NotificationProvider } from './modules/notification';
import ErrorBoundary from './layouts/ErrorBoundary';
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

  // eslint-disable-next-line camelcase
  UNSAFE_componentWillMount() {
    if (this.props.config) {
      initConfig(this.props.config);
    }
  }

  render() {
    const { store } = this.props;

    return (
      <InstallPromptProvider>
        <Provider store={store}>
          <WithSettings
            networkDisabled
            render={(settings) => (
              <I18nLoader locale={settings.default_locale}>
                <ErrorBoundary>
                  <RoutingProvider settings={settings}>
                    <PageTitle />
                    <DeviceProvider>
                      <RoutingConsumer
                        render={({ routes }) => (
                          <SwitchWithRoutes routes={routes} />
                        )}
                      />
                    </DeviceProvider>
                    <NotificationProvider />
                  </RoutingProvider>
                </ErrorBoundary>
              </I18nLoader>
            )}
          />
        </Provider>
      </InstallPromptProvider>
    );
  }
}

export default App;
