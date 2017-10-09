import React, { PropTypes } from 'react';
import enableI18n from '../../src/services/i18n';

const style = {
  component: {
    margin: '1rem',
    border: '1px solid blue',
  },
  componentSmall: {
    height: '5rem',
  },
  componentTall: {
    height: '15rem',
  },
  componentInline: {
    display: 'inline-block',
    height: 'auto',
  },
};

const ComponentWrapper = ({ size, inline, children }) => {
  let componentStyle = { ...style.component };

  if (size === 'tall') {
    componentStyle = { ...componentStyle, ...style.componentTall };
  }

  if (size === 'small') {
    componentStyle = { ...componentStyle, ...style.componentTall };
  }

  if (inline) {
    componentStyle = { ...componentStyle, ...style.componentInline };
  }

  return (
    <div style={componentStyle}>{children}</div>
  );
};

ComponentWrapper.propTypes = {
  size: PropTypes.oneOf(['small', 'tall']),
  inline: PropTypes.bool,
  children: PropTypes.node.isRequired,
};

export default enableI18n(ComponentWrapper);
