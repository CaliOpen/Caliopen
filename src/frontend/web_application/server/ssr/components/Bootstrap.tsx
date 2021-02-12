import * as React from 'react';
import { StaticRouter, StaticRouterProps } from 'react-router-dom';
import App, { AppProps } from 'src/App';

interface BootstrapProps {
  store: AppProps['store'];
  location: StaticRouterProps['location'];
  context: StaticRouterProps['context'];
}

const Bootstrap = ({ store, location, context }: BootstrapProps) => (
  <StaticRouter location={location} context={context}>
    <App store={store} />
  </StaticRouter>
);

export default Bootstrap;
