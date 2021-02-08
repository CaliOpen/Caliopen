import React from 'react';
import { TabConsumer } from '../../../../modules/tab';

export const withTabs = () => (C) => (props) => (
  <TabConsumer
    render={({ tabs, removeTab }) => (
      <C tabs={tabs} removeTab={removeTab} {...props} />
    )}
  />
);
