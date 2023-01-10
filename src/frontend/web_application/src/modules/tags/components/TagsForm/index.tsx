import * as React from 'react';
import { Trans, withI18nProps, withI18n, useLingui } from '@lingui/react';
import {
  Button,
  Icon,
  Dropdown,
  VerticalMenu,
  VerticalMenuItem,
} from 'src/components';
import TagItem from '../TagItem';
import TagFieldGroup from '../TagFieldGroup';
import { getTagLabel } from '../../services/getTagLabel';
import { searchTags } from '../../services/searchTags';
import { useTags } from '../../hooks/useTags';
import { NewTag, TagPayload } from '../../types';
import './style.scss';
import { TagMixed } from '../../query';

function useFoundTags(selectedTags: TagMixed[], terms: string) {
  const { i18n } = useLingui();
  const { tags } = useTags();

  const selectedTagSet = new Set(selectedTags);
  const availableTags = tags.filter((tag) => !selectedTagSet.has(tag));

  if (!terms) {
    return availableTags.slice(0, 20);
  }

  return searchTags(i18n, availableTags, terms).slice(0, 20);
}

interface TagsFormProps extends withI18nProps {
  initialTags: TagPayload[];
  onSubmit: (tags: TagMixed[]) => void;
}

function TagsForm({ initialTags, onSubmit }: TagsFormProps) {
  const { i18n } = useLingui();
  const [terms, setTerms] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [errors, setErrors] = React.useState<React.ReactNode[]>([]);
  const [nextTags, setNextTags] = React.useState<TagMixed[]>(initialTags);
  const inputSearchElement = React.useRef<HTMLInputElement>(null);
  const dropdownElement = React.useRef<HTMLDivElement>(null);

  const foundTags = useFoundTags(nextTags, terms);

  const handleSearchChange = async (searchTerms) => {
    setTerms(searchTerms);
  };

  const handleAddNewTag = async () => {
    if (terms.length > 0) {
      let newTag: NewTag = { label: terms };
      if (foundTags.length === 1) {
        [newTag] = foundTags;
      }

      if (nextTags.findIndex((tag) => tag.label === newTag.label) >= 0) {
        // nothing to do
        return;
      }

      setNextTags((tags) => [...tags, newTag]);
      setTerms('');
    }
  };

  const createHandleAddTag = (nextTag: TagPayload) => () => {
    setErrors([]);

    if (nextTags.findIndex((tag) => tag.label === nextTag.label) >= 0) {
      // nothing to do
      return;
    }
    setNextTags((tags) => [...tags, nextTag]);
    setTerms('');
  };

  const handleDeleteTag = (oldTag: TagPayload) => {
    setErrors([]);
    setNextTags((tags) => tags.filter((tag) => tag !== oldTag));
  };

  const handleClickValidate = async () => {
    try {
      setIsLoading(true);
      await onSubmit(nextTags);
    } catch (err) {
      setErrors([
        <Trans
          id="settings.tag.form.error.update_failed"
          message="Unexpected error occured"
        />,
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="m-tags-form">
      {nextTags.length > 0 && (
        <div className="m-tags-form__section">
          {nextTags.map((tag) => (
            <TagItem tag={tag} key={tag.name} onDelete={handleDeleteTag} />
          ))}
        </div>
      )}

      <div className="m-tags-form__section">
        <TagFieldGroup
          errors={errors}
          terms={terms}
          onChange={handleSearchChange}
          onSubmit={handleAddNewTag}
          innerRef={inputSearchElement}
        />
        <Dropdown
          id="search-tag-dropdown"
          className="m-tags-form__dropdown"
          ref={dropdownElement}
          dropdownControlRef={inputSearchElement}
          closeOnClick="exceptSelf"
          withShadow
        >
          {foundTags.length > 0 && (
            <VerticalMenu>
              {foundTags.map((tag) => (
                <VerticalMenuItem key={tag.name}>
                  <Button
                    className="m-tags-form__found-tag"
                    display="expanded"
                    shape="plain"
                    onClick={createHandleAddTag(tag)}
                  >
                    <span className="m-tags-form__found-tag-text">
                      {getTagLabel(i18n, tag)}
                    </span>{' '}
                    <Icon type="plus" />
                  </Button>
                </VerticalMenuItem>
              ))}
            </VerticalMenu>
          )}
        </Dropdown>
      </div>
      <div className="m-tags-form__buttons">
        <Button
          type="button"
          onClick={handleClickValidate}
          shape="plain"
          disabled={isLoading}
          isLoading={isLoading}
        >
          <Trans id="tag-form.validate" message="Validate" />
        </Button>
      </div>
    </div>
  );
}

export default withI18n()(TagsForm);
