import React from 'react';
import TabConsumer from '../components/TabConsumer';

export const withCurrentTab = () => (C) =>
  function (props) {
    return (
      <TabConsumer
        render={({ getCurrentTab }) => {
          const currentTab = getCurrentTab();

          return <C currentTab={currentTab} {...props} />;
        }}
      />
    );
  };
