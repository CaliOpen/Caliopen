import React from 'react';
import ActionButton from '../ActionButton';
import Icon from '../../../../../Icon';

const Presenter = props => (
  <ActionButton {...props}>
    <Icon type="comment-o" /> {'call-to-action.action.compose_contact'}
  </ActionButton>
);

export default Presenter;
