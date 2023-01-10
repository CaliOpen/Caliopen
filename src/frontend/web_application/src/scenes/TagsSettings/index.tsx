import * as React from 'react';
import { withI18n, withI18nProps } from '@lingui/react';
import { useTags } from 'src/modules/tags';
import { Section, Spinner } from 'src/components';
import TagSearch from './components/TagSearch';
import TagInput from './components/TagInput';
import './style.scss';

type Props = withI18nProps;

function TagsSettings({ i18n }: Props) {
  const { tags, status } = useTags();

  return (
    <div className="s-tags-settings">
      <div className="s-tags-settings__create">
        <Section
          title={i18n._(/* i18n */ 'settings.tags.title.create', undefined, {
            message: 'Create new tag',
          })}
        >
          <TagSearch />
        </Section>
      </div>
      <div className="s-tags-settings__tags">
        <Section
          title={i18n._(/* i18n */ 'settings.tags.title', undefined, {
            message: 'Tags',
          })}
        >
          {['idle', 'error'].includes(status) ? (
            <Spinner svgTitleId="tags-spinner" isLoading />
          ) : (
            tags.map((tag) => <TagInput key={tag.name} tag={tag} />)
          )}
        </Section>
      </div>
    </div>
  );
}

export default withI18n()(TagsSettings);
