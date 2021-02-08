import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withI18n } from '@lingui/react';
import classnames from 'classnames';
import { WithTags, getTagLabel } from '../../../../modules/tags';
import { withTagSearched } from '../../hoc/withTagSearched';
import { Link, NavList, NavItem } from '../../../../components';

import './style.scss';

@withI18n()
@withTagSearched()
class TagList extends Component {
  static propTypes = {
    i18n: PropTypes.shape({ _: PropTypes.func }).isRequired,
    tagSearched: PropTypes.string,
  };

  static defaultProps = {
    tagSearched: '',
  };

  state = {};

  sortTags = (i18n, tags) =>
    [...tags].sort((a, b) =>
      getTagLabel(i18n, a).localeCompare(getTagLabel(i18n, b))
    );

  renderItem({ tagName, label }) {
    const { tagSearched } = this.props;
    const tagClassName = classnames('m-tag-list__tag', {
      'm-tag-list__tag--active': tagSearched === tagName,
    });

    const param = tagName.length > 0 ? `?tag=${tagName}` : '';

    return (
      <Link
        display="inline"
        noDecoration
        to={`/contacts${param}`}
        className={tagClassName}
      >
        {label}
      </Link>
    );
  }

  render() {
    const { i18n } = this.props;

    return (
      <NavList className="m-tag-list" dir="vertical">
        <NavItem>
          {this.renderItem({
            tagName: '',
            label: i18n._('tag_list.all_contacts', null, {
              defaults: 'All contacts',
            }),
          })}
        </NavItem>
        <WithTags
          render={(userTags) =>
            this.sortTags(i18n, userTags).map((tag) => (
              <NavItem key={tag.name}>
                {this.renderItem({
                  tagName: tag.name,
                  label: getTagLabel(i18n, tag),
                })}
              </NavItem>
            ))
          }
        />
      </NavList>
    );
  }
}

export default TagList;
