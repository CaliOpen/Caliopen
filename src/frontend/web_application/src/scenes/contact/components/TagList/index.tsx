import * as React from 'react';
import { Trans, withI18n, withI18nProps } from '@lingui/react';
import { getTagLabel, useTags } from 'src/modules/tags';
import { Link, NavList, NavItem } from 'src/components';

import './style.scss';

type Props = withI18nProps;

function TagList({ i18n }: Props) {
  const { tags } = useTags();

  const sortedTags = React.useMemo(
    () =>
      [...tags].sort((a, b) =>
        getTagLabel(i18n, a).localeCompare(getTagLabel(i18n, b))
      ),
    [tags]
  );

  return (
    <NavList className="m-tag-list" dir="vertical">
      <NavItem>
        <Link
          display="inline"
          noDecoration
          to="/contacts"
          className="m-tag-list__tag"
        >
          <Trans id="tag_list.all_contacts">All contacts</Trans>
        </Link>
      </NavItem>
      {sortedTags.map((tag) => (
        <NavItem key={tag.name}>
          <Link
            display="inline"
            noDecoration
            to={`/contacts?tag=${tag.name}`}
            className="m-tag-list__tag"
          >
            {getTagLabel(i18n, tag)}
          </Link>
        </NavItem>
      ))}
    </NavList>
  );
}

export default withI18n()(TagList);
