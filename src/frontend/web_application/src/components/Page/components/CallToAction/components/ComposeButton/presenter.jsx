import React from 'react';
import ActionButton from '../ActionButton';
import Icon from '../../../../../Icon';

const Presenter = props => (
  <ActionButton {...props}>
    <Icon type="plus" /> {'call-to-action.action.compose'}
  </ActionButton>
);

export default Presenter;
