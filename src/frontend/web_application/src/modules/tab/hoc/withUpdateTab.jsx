import React from 'react';
import TabConsumer from '../components/TabConsumer';

export const withUpdateTab = () => (C) => (props) => (
  <TabConsumer
    render={({ updateTab }) => <C updateTab={updateTab} {...props} />}
  />
);
