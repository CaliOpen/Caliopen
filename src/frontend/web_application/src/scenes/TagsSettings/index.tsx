import * as React from 'react';
import { Trans, withI18n, withI18nProps } from '@lingui/react';
import { useDispatch } from 'react-redux';
import { useTags } from 'src/modules/tags';
import { invalidate } from 'src/modules/tags/store';
import { Section, Spinner } from 'src/components';
import TagSearch from './components/TagSearch';
import TagInput from './components/TagInput';
import './style.scss';

interface Props extends withI18nProps {}

function TagsSettings({ i18n }: Props) {
  const dispatch = useDispatch();

  const { tags, isPending, initialized } = useTags();
  // const { tags, status, initialized } = useTags();

  // FIXME: how mutation will impact other resource?
  // how to invalidate contacts, discussions …?
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
          {!initialized && <Spinner isLoading />}

          {initialized && (status || 0) >= 400 && (
            <Trans>An error occurred</Trans>
          )}

          {initialized &&
            (status || 0) < 400 &&
            tags?.map((tag) => (
              <TagInput
                key={tag.name}
                tag={tag}
                onUpdateSuccess={handleInvalidate}
                onDeleteSuccess={handleInvalidate}
              />
            ))}
        </Section>
      </div>
    </div>
  );
}

export default withI18n()(TagsSettings);
