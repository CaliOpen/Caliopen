import React from 'react';
import PropTypes from 'prop-types';
import { withI18n } from '@lingui/react';
import { compose } from 'redux';
import classnames from 'classnames';
import { Badge } from '../../../../components';
import { getTagLabelFromName, withTags } from '../../../../modules/tags';

import './style.scss';

const TagList = ({ className, i18n, tags: allTags, message }) => {
  if (!message.tags || message.tags.length === 0) {
    return null;
  }

  return (
    <ul className={classnames(className, 'm-message-tags-list')}>
      {message.tags.map((tag) => (
        <li key={tag} className="s-mail-message__tag m-message-tags-list__tag">
          <Badge
            to={`/search-results?term=${getTagLabelFromName(
              i18n,
              allTags,
              tag
            )}&doctype=message`}
          >
            {getTagLabelFromName(i18n, allTags, tag)}
          </Badge>
        </li>
      ))}
    </ul>
  );
};

TagList.propTypes = {
  i18n: PropTypes.shape({ _: PropTypes.func }).isRequired,
  className: PropTypes.string,
  message: PropTypes.shape({
    tags: PropTypes.arrayOf(PropTypes.string),
  }).isRequired,
  tags: PropTypes.arrayOf(PropTypes.shape({})),
};
TagList.defaultProps = {
  className: undefined,
  tags: [],
};

export default compose(withTags(), withI18n())(TagList);
