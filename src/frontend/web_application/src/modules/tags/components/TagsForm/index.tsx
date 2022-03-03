import * as React from 'react';
import { Trans, withI18nProps, withI18n } from '@lingui/react';
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
import { TagAPIPostPayload, TagCommon, TagPayload } from '../../types';
import './style.scss';

interface TagsFormProps extends withI18nProps {
  tagCollection: (TagPayload | TagCommon)[];
  updateTags: (tags: (TagAPIPostPayload | TagPayload)[]) => void;
}

function useFoundTags(
  i18n: withI18nProps['i18n'],
  selectedTags: TagCommon[],
  terms: string
) {
  const { tags } = useTags();

  const selectedTagSet = new Set(selectedTags);
  const availableTags = tags.filter((tag) => !selectedTagSet.has(tag));

  if (!terms) {
    return availableTags.slice(0, 20);
  }

  return searchTags(i18n, availableTags, terms).slice(0, 20);
}

function TagsForm({ tagCollection, i18n, updateTags }: TagsFormProps) {
  const [terms, setTerms] = React.useState('');
  const [errors, setErrors] = React.useState<React.ReactNode[]>([]);
  const inputSearchElement = React.useRef<HTMLInputElement>(null);
  const dropdownElement = React.useRef<HTMLDivElement>(null);

  const foundTags = useFoundTags(i18n, tagCollection, terms);

  const handleSearchChange = async (searchTerms) => {
    setTerms(searchTerms);
  };

  const handleAddNewTag = async () => {
    if (terms.length > 0) {
      let newTag = { label: terms };
      if (foundTags.length === 1) {
        newTag = foundTags[0];
      }
      try {
        updateTags([...tagCollection, newTag]);
        setTerms('');
      } catch (err) {
        if (foundTags.length !== 1) {
          setErrors([
            <Trans id="settings.tag.form.error.create_fail">
              Unable to create the tag. A tag with the same id may already
              exist.
            </Trans>,
          ]);
          return;
        }

        setErrors([
          <Trans id="settings.tag.form.error.update_failed">
            Unexpected error occured
          </Trans>,
        ]);
      }
    }
  };

  const createHandleAddTag = (tag: TagCommon) => () => {
    setErrors([]);
    try {
      updateTags([...tagCollection, tag]);
    } catch (err) {
      setErrors([
        <Trans id="settings.tag.form.error.update_failed">
          Unexpected error occured
        </Trans>,
      ]);
    }
  };

  const handleDeleteTag = (tag: TagCommon) => {
    setErrors([]);
    try {
      updateTags(tagCollection.filter((item) => item !== tag));
    } catch (err) {
      setErrors([
        <Trans id="settings.tag.form.error.update_failed">
          Unexpected error occured
        </Trans>,
      ]);
    }
  };

  return (
    <div className="m-tags-form">
      {tagCollection.length > 0 && (
        <div className="m-tags-form__section">
          {tagCollection.map((tag) => (
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
        >
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
        </Dropdown>
      </div>
    </div>
  );
}

export default withI18n()(TagsForm);
