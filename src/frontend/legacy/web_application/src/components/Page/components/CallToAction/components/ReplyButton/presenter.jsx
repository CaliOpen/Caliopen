import React from 'react';
import ActionButton from '../ActionButton';
import Icon from '../../../../../Icon';

const Presenter = props => (
  <ActionButton {...props}>
    <Icon type="reply" /> {'call-to-action.action.reply'}
  </ActionButton>
);

export default Presenter;
