import React from 'react';
import { createSelector } from 'reselect';
import { withRouter, matchPath } from 'react-router-dom';
import { connect } from 'react-redux';
import Presenter from './presenter';
import { ComposeButton, CreateContactButton /* , ComposeContactButton, ReplyButton */} from './components';

// ** hot fix **
// ** no more principalActionSelector: all actions are stored in availableActionsSelector
// ** display same call-to-action on every page and every application
// ** hide ComposeContactButton and ReplyButton
// FIXME: refactor or delete call-to-action component according to new UI


// const applicationSelector = state => state.application.applicationName;

const defaultActionsSelector = createSelector(
  state => state,
  () => ([
    {
      route: '/',
      // application: 'contacts',
      children: props => (<CreateContactButton {...props} />),
    },
    /* {
      route: '/contacts/:contactId',
      disabled: true,
      children: props => (<ComposeContactButton {...props} />),
    }, */
    {
      route: '/',
      // application: 'discussions',
      children: props => (<ComposeButton {...props} />),
    },
    /* {
      route: '/discussions/:discussionId',
      disabled: true,
      children: props => (<ReplyButton {...props} />),
    }, */
  ])
);

/* export const principalActionSelector = createSelector(
  [defaultActionsSelector, applicationSelector, (state, props) => props.location],
  (actions, applicationName, location) => actions.reduce(
    (prev, action) => {
      if (matchPath(location.pathname, { path: action.route })) {
        return action;
      }

      if (!prev && applicationName === action.application) {
        return action;
      }

      return prev;
    },
    undefined)
); */

export const availableActionsSelector = createSelector(
  [
    defaultActionsSelector,
    (state, props) => props.location,
  ],
  (actions, location) => actions
    .filter(action => matchPath(location.pathname, { path: action.route }))
);

const mapStateToProps = (state, props) => ({
  availableActions: availableActionsSelector(state, props),
});

export default withRouter(connect(mapStateToProps)(Presenter));
