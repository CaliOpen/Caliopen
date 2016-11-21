import React from 'react';
import { createSelector } from 'reselect';
import { withRouter } from 'react-router';
import { connect } from 'react-redux';
import Presenter from './presenter';
import { ComposeButton, CreateContactButton, ComposeContactButton, ReplyButton } from './components';

const applicationSelector = state => state.application.applicationName;

const defaultActionsSelector = createSelector(
  state => state,
  () => ([
    {
      route: 'contact-list',
      application: 'contacts',
      children: props => (<CreateContactButton {...props} />),
    },
    {
      route: 'contact',
      disabled: true,
      children: props => (<ComposeContactButton {...props} />),
    },
    {
      route: '/',
      application: 'discussions',
      children: props => (<ComposeButton {...props} />),
    },
    {
      route: 'thread',
      disabled: true,
      children: props => (<ReplyButton {...props} />),
    },
  ])
);

export const principalActionSelector = createSelector(
  [defaultActionsSelector, applicationSelector, (state, props) => props.router],
  (actions, applicationName, router) => actions.reduce(
    (prev, action) => {
      if (router.isActive(action.route)) {
        return action;
      }

      if (!prev && applicationName === action.application) {
        return action;
      }

      return prev;
    },
    undefined)
);

export const availableActionsSelector = createSelector(
  [
    defaultActionsSelector,
    principalActionSelector,
    (state, props) => props.router,
  ],
  (actions, principalAction, router) => actions.filter(
    action => !router.isActive(action.route) && !!action.application && action !== principalAction
  )
);

const mapStateToProps = (state, props) => ({
  principalAction: principalActionSelector(state, props),
  availableActions: availableActionsSelector(state, props),
});

export default withRouter(connect(mapStateToProps)(Presenter));
