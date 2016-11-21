import React from 'react';
import ActionButton from '../ActionButton';
import Icon from '../../../../../Icon';

const Presenter = props => (
  <ActionButton {...props}>
    <Icon type="user" /> {'call-to-action.action.create_contact'}
  </ActionButton>
);

export default Presenter;
