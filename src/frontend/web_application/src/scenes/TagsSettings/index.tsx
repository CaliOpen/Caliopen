import * as React from 'react';
import { withI18n, withI18nProps } from '@lingui/react';
import { useGetTagsQuery } from 'src/modules/tags/store';
import { Section, Spinner } from 'src/components';
import TagSearch from './components/TagSearch';
import TagInput from './components/TagInput';
import './style.scss';

interface Props extends withI18nProps {}

function TagsSettings({ i18n }: Props) {
  const res = useGetTagsQuery();
  const tags = res.data?.tags || [];

  return (
    <div className="s-tags-settings">
      <div className="s-tags-settings__create">
        <Section
          title={i18n._('settings.tags.title.create', undefined, {
            defaults: 'Create new tag',
          })}
        >
          <TagSearch />
        </Section>
      </div>
      <div className="s-tags-settings__tags">
        <Section
          title={i18n._('settings.tags.title', undefined, {
            defaults: 'Tags',
          })}
        >
          {res.isLoading ? (
            <Spinner isLoading />
          ) : (
            tags.map((tag) => <TagInput key={tag.name} tag={tag} />)
          )}
        </Section>
      </div>
    </div>
  );
}

export default withI18n()(TagsSettings);
