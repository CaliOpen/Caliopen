import React from 'react';
import { compose } from 'redux';
import Presenter from './presenter';
import { RoutingConsumer } from '../../../../modules/routing';
import { withTabs } from './withTabs';

const withRoutes = () => (C) =>
  function (props) {
    return (
      <RoutingConsumer
        render={({ routes }) => <C routes={routes} {...props} />}
      />
    );
  };

export default compose(withTabs(), withRoutes())(Presenter);
