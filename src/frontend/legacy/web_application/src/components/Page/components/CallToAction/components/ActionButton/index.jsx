import React, { PropTypes } from 'react';
import Tappable from 'react-tappable/lib/Tappable';
import Button from '../../../../../Button';

const ActionButton = ({ action, ...props }) => {
  const tappableProps = {
    onTap: () => action(),
    // noop to prevent tap on hold
    // this allow parent to get focus
    onPress: () => {},
  };

  return (
    <Tappable {...tappableProps}>
      <Button {...props} modifiers={{ plain: true }} />
    </Tappable>
  );
};

ActionButton.propTypes = {
  action: PropTypes.func.isRequired,
};

export default ActionButton;
