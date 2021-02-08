import React from 'react';
import ReactDOMServer from 'react-dom/server';
import template from '../../dist/server/template.html';

const renderTemplate = (markup) =>
  [{ key: '%MARKUP%', value: markup }].reduce(
    (str, current) => str.replace(current.key, current.value),
    template
  );

/**
 * This engine uses react components, those are pre-compiled and given in the route argument e.g:
 *
 * `createEngine({ 'login.component': require('./Login').default })`
 *
 * the components are in-memory, a view path is not required. The express render method will work as
 * usually: `app.render('login.component', {})`
 */
const createEngine = (routes = {}) => {
  const renderview = (viewName, options, cb) => {
    // XXX: cb is useless : not async, try catch also
    let markup;
    try {
      markup = ReactDOMServer.renderToStaticMarkup(
        React.createElement(routes[viewName], options)
      );
    } catch (e) {
      return cb(e);
    }

    return cb(null, renderTemplate(markup));
  };

  return renderview;
};

export default createEngine;
