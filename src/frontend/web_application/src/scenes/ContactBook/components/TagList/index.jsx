import React from 'react';
import PropTypes from 'prop-types';
import { v1 as uuidV1 } from 'uuid';
import classnames from 'classnames';
import Button from '../../../../components/Button';
import NavList, { ItemContent } from '../../../../components/NavList';

import './style.scss';

function nbContactsbyTag(list, tag) {
  /**
 * Count the number of time `tag` appears in `list` (array of all tags from all contacts)
 * (= number of contacts tagged with `tag`)
 * @param Array(<string>) list
 * @param <string> tag
 * @return <number>
 **/
  const count = [];
  list.map(item => item === tag && count.push(item));

  return count.length;
}

const TagItem = ({ title, link, onTagClick, nbContacts, active, className }) => {
  const tagClassName = classnames(
    className,
    'm-tag-list__tag',
    {
      'm-tag-list__tag--active': active,
    }
  );


  return (
    <ItemContent className="m-tag-list__item">
      <Button
        onClick={onTagClick}
        value={link}
        className={tagClassName}
      >
        {title} ({nbContacts})
      </Button>
    </ItemContent>
  );
};

TagItem.propTypes = {
  title: PropTypes.string.isRequired,
  link: PropTypes.string,
  nbContacts: PropTypes.number.isRequired,
  onTagClick: PropTypes.func.isRequired,
  active: PropTypes.bool,
  className: PropTypes.string,
};

TagItem.defaultProps = {
  active: false,
  className: '',
  link: null,
};

const TagList = ({ tags, onTagClick, nbContactsAll, activeTag, __ }) => {
  const list = tags.sort((a, b) => a.localeCompare(b));
  const tagList = Array.from(new Set(list));

  return (
    <NavList className="m-tag-list" dir="vertical">
      <TagItem
        title={__('tag_list.all_contacts')}
        link=""
        nbContacts={nbContactsAll}
        onTagClick={onTagClick}
        active={activeTag === ''}
      />
      {tagList.map(tag => tag !== '' &&
        <TagItem
          title={tag}
          link={tag}
          nbContacts={nbContactsbyTag(list, tag)}
          key={uuidV1()}
          onTagClick={onTagClick}
          active={tag === activeTag}
        />
      )}
    </NavList>
  );
};

TagList.propTypes = {
  tags: PropTypes.arrayOf(PropTypes.string).isRequired,
  onTagClick: PropTypes.func.isRequired,
  activeTag: PropTypes.string.isRequired,
  nbContactsAll: PropTypes.number.isRequired,
  __: PropTypes.func.isRequired,
};
export default TagList;
