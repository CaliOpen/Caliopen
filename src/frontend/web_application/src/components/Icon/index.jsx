import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import './style.scss';

export const typeAssoc = {
  at: 'fa fa-at',
  'angle-down': 'fa fa-angle-down',
  'arrow-right': 'fa fa-arrow-right',
  'arrow-left': 'fa fa-arrow-left',
  bell: 'fa fa-bell',
  'birthday-cake': 'fa fa-birthday-cake',
  briefcase: 'fa fa-briefcase',
  building: 'fa fa-building',
  calendar: 'fa fa-calendar',
  'caret-up': 'fa fa-caret-up',
  'caret-down': 'fa fa-caret-down',
  check: 'fa fa-check',
  cog: 'fa fa-cog',
  comment: 'fa fa-comment',
  comments: 'fa fa-comments',
  'comments-o': 'fa fa-comments-o',
  crosshairs: 'fa fa-crosshairs',
  download: 'fa fa-download',
  'dot-circle-o': 'fa-dot-circle-o',
  edit: 'fa fa-edit',
  envelope: 'fa fa-envelope',
  'ellipsis-v': 'fa fa-ellipsis-v',
  email: 'fa fa-envelope',
  editor: 'fa fa-font',
  'exclamation-triangle': 'fa fa-exclamation-triangle',
  desktop: 'fa fa-desktop',
  facebook: 'fa fa-facebook',
  filter: 'fa fa-filter',
  folder: 'fa fa-folder-open',
  home: 'fa fa-home',
  'info-circle': 'fa fa-info-circle',
  key: 'fa fa-key',
  laptop: 'fa fa-laptop',
  lock: 'fa fa-lock',
  'map-marker': 'fa fa-map-marker',
  paperclip: 'fa fa-paperclip',
  pencil: 'fa fa-pencil',
  plug: 'fa fa-plug',
  plus: 'fa fa-plus',
  phone: 'fa fa-phone',
  'question-circle': 'fa fa-question-circle',
  remove: 'fa fa-remove',
  reply: 'fa fa-reply',
  save: 'fa fa-floppy-o',
  send: 'fa fa-paper-plane',
  search: 'fa fa-search',
  server: 'fa fa-server',
  share: 'fa fa-share',
  'share-alt': 'fa fa-share-alt',
  shield: 'fa fa-shield',
  smartphone: 'fa fa-mobile',
  user: 'fa fa-user',
  users: 'fa fa-users',
  tablet: 'fa fa-tablet',
  tags: 'fa fa-tags',
  twitter: 'fa fa-twitter',
  'th-large': 'fa fa-th-large',
  trash: 'fa fa-trash',
  warning: 'fa fa-warning',
  'window-maximize': 'fa fa-window-maximize',
};


const Icon = ({
  className, type, spaced, rightSpaced, ...props
}) => {
  // eslint-disable-next-line no-console
  const typeClassName = typeAssoc[type] || console.error(`The type "${type}" is not a valid Icon component type`);
  const iconProps = {
    ...props,
    className: classnames(
      className,
      typeClassName,
      { 'm-icon--spaced': spaced, 'm-icon--right-spaced': rightSpaced }
    ),
  };

  return <i {...iconProps} />;
};

Icon.propTypes = {
  className: PropTypes.string,
  type: PropTypes.string,
  spaced: PropTypes.bool,
  rightSpaced: PropTypes.bool,
};
Icon.defaultProps = {
  className: undefined,
  type: undefined,
  spaced: false,
  rightSpaced: false,
};

export default Icon;
