import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import './style.scss';

function BlockList({ className, children, ...props }) {
  return <ul className={classnames('m-block-list', className)} {...props}>
    {children.map((comp, key) => (
      <li className="m-block-list__item" key={key}>
        {comp}
      </li>
    ))}
  </ul>
}

BlockList.propTypes = {
  className: PropTypes.string,
  children: PropTypes.arrayOf(PropTypes.node).isRequired,
};

BlockList.defaultProps = {
  className: undefined,
};

export default BlockList;
