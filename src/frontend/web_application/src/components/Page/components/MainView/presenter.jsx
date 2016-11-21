import React from 'react';
import './style.scss';

const MainView = (header, nav, callToAction, notification, children) => (
  <div className="l-body">
    { header }
    { nav }
    <section role="main">
      <div className="l-body__content">
        { children }
      </div>
    </section>
    { callToAction }
    { notification }
  </div>
);

export default MainView;
