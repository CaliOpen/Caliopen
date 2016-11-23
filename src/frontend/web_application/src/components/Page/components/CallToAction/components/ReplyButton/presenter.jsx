import React, { PropTypes } from 'react';
import { withTranslator } from '@gandi/react-translate';import ActionButton from '../ActionButton';
import Icon from '../../../../../Icon';

const Presenter = ({ translator: { __ }, ...props }) => (
  <ActionButton {...props}>
    <Icon type="reply" /> {__('call-to-action.action.reply')}
  </ActionButton>
);

Presenter.propTypes = {
  translator: PropTypes.shape({ __: PropTypes.func.isRequired }),
};

export default withTranslator({ propsNamespace: 'translator' })(Presenter);
