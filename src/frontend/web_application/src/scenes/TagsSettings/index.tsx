import * as React from 'react';
import { withI18n, withI18nProps } from '@lingui/react';
import { useDispatch } from 'react-redux';
import { useTags } from 'src/modules/tags';
import { invalidate } from 'src/modules/tags/store';
import { Section, Spinner } from 'src/components';
import TagSearch from './components/TagSearch';
import TagInput from './components/TagInput';
import './style.scss';

type Props = withI18nProps

function TagsSettings({ i18n }: Props) {
  const dispatch = useDispatch();

  const { tags, status, initialized } = useTags();

  const handleInvalidate = () => {
    dispatch(invalidate());
  };

  return (
    <div className="s-tags-settings">
      <div className="s-tags-settings__create">
        <Section
          title={i18n._('settings.tags.title.create', undefined, {
            defaults: 'Create new tag',
          })}
        >
          <TagSearch onCreateSuccess={handleInvalidate} />
        </Section>
      </div>
      <div className="s-tags-settings__tags">
        <Section
          title={i18n._('settings.tags.title', undefined, {
            defaults: 'Tags',
          })}
        >
          {!initialized && status !== 'rejected' ? (
            <Spinner svgTitleId="tags-spinner" isLoading />
          ) : (
            tags.map((tag) => (
              <TagInput
                key={tag.name}
                tag={tag}
                onUpdateSuccess={handleInvalidate}
                onDeleteSuccess={handleInvalidate}
              />
            ))
          )}
        </Section>
      </div>
    </div>
  );
}

export default withI18n()(TagsSettings);
