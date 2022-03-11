import React from 'react';
import { TabConsumer } from '../../../../modules/tab';

export const withTabs = () => (C) => function(props) {
  return <TabConsumer
    render={({ tabs, removeTab }) => (
      <C tabs={tabs} removeTab={removeTab} {...props} />
    )}
  />
};
