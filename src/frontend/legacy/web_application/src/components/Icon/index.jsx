import React, { PropTypes } from 'react';
import classnames from 'classnames';

const typeAssoc = {
  search: 'fa fa-search',
  user: 'fa fa-user',
  'caret-up': 'fa fa-caret-up',
  'caret-down': 'fa fa-caret-down',
  envelope: 'fa fa-envelope',
  comments: 'fa fa-comments',
  'comments-o': 'fa fa-comments-o',
  users: 'fa fa-users',
  plus: 'fa fa-plus',
  reply: 'fa fa-reply',
};


const Icon = ({ className, type, ...props }) => {
  // eslint-disable-next-line no-console
  const typeClassName = typeAssoc[type] || console.error(`The type "${type}" is not a valid Icon component type`);
  const iconProps = {
    ...props,
    className: classnames(
      className,
      typeClassName
    ),
  };

  return <i {...iconProps} />;
};

Icon.propTypes = {
  className: PropTypes.string,
  type: PropTypes.string,
};

export default Icon;
