import * as React from 'react';
import PropTypes from 'prop-types';
import { withI18n } from '@lingui/react';
import { WithTags, getTagLabel } from '../../../../modules/tags';
import { Link, NavList, NavItem } from '../../../../components';

import './style.scss';

// @ts-expect-error ts-migrate(1238) FIXME: Unable to resolve signature of class decorator whe... Remove this comment to see the full error message
@withI18n()
class TagList extends React.PureComponent {
  static propTypes = {
    i18n: PropTypes.shape({ _: PropTypes.func }).isRequired,
  };

  static defaultProps = {};

  state = {};

  sortTags = (i18n, tags) =>
    [...tags].sort((a, b) =>
      getTagLabel(i18n, a).localeCompare(getTagLabel(i18n, b))
    );

  renderItem = ({ tagName, label }) => {
    const param = tagName.length > 0 ? `?tag=${tagName}` : '';

    return (
      <Link
        display="inline"
        noDecoration
        to={`/contacts${param}`}
        className="m-tag-list__tag"
      >
        {label}
      </Link>
    );
  };

  render() {
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'i18n' does not exist on type 'Readonly<{... Remove this comment to see the full error message
    const { i18n } = this.props;

    return (
      <NavList className="m-tag-list" dir="vertical">
        // @ts-expect-error ts-migrate(2739) FIXME: Type '{ children: Element; }' is missing the follo... Remove this comment to see the full error message
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
              // @ts-expect-error ts-migrate(2739) FIXME: Type '{ children: Element; key: any; }' is missing... Remove this comment to see the full error message
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
