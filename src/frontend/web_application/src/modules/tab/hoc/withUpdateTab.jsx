import React from 'react';
import TabConsumer from '../components/TabConsumer';

export const withUpdateTab = () => (C) => function(props) {
  return <TabConsumer
    render={({ updateTab }) => <C updateTab={updateTab} {...props} />}
  />
};
