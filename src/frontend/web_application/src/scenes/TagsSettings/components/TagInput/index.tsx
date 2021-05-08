import * as React from 'react';
import { withI18n, withI18nProps } from '@lingui/react';
import { getTagLabel } from 'src/modules/tags';
import { TagPayload } from 'src/modules/tags/types';
import {
  Button,
  Icon,
  Spinner,
  FormGrid,
  FieldErrors,
  TextFieldGroup,
} from 'src/components';
import {
  useUpdateTagMutation,
  useDeleteTagMutation,
} from 'src/modules/tags/store';

import './style.scss';

const TAG_TYPE_USER = 'user';

interface Props extends withI18nProps {
  tag: TagPayload;
}

function TagInput({ i18n, tag }: Props) {
  const [tagLabel, setTagLabel] = React.useState(tag.label);
  const [edit, setEdit] = React.useState(false);
  const [tagErrors, setTagErrors] = React.useState<string[]>([]);
  const [updateTag, updateMeta] = useUpdateTagMutation();
  const [deleteTag, deleteMeta] = useDeleteTagMutation();

  const pending = updateMeta.isLoading || deleteMeta.isLoading;

  const handleChange = (ev) => {
    setTagLabel(ev.target.value);
    setTagErrors([]);
  };

  const handleClickTag = () => {
    setEdit(true);
  };

  const handleUpdateTag = async () => {
    if (tag.label === tagLabel) {
      setEdit(false);
      return;
    }

    try {
      await updateTag({
        original: tag,
        tag: {
          ...tag,
          label: tagLabel,
        },
      }).unwrap();
      setEdit(false);
    } catch (errors) {
      setTagErrors(errors.map((err) => err.message));
    }
  };

  const handleDeleteTag = async () => {
    try {
      await deleteTag(tag).unwrap();
    } catch (errors) {
      setTagErrors(errors.map((err) => err.message));
    }
  };

  if (edit) {
    return (
      <FormGrid className="m-tag-input">
        <TextFieldGroup
          name={tag.name}
          className="m-tag-input__input"
          label={tag.name}
          placeholder={getTagLabel(i18n, tag)}
          value={tagLabel}
          onChange={handleChange}
          showLabelforSr
          autoFocus
          errors={tagErrors}
        />
        <Button
          onClick={handleUpdateTag}
          aria-label={i18n._('settings.tag.action.save-tag', undefined, {
            defaults: 'Save',
          })}
          icon={pending ? <Spinner isLoading display="inline" /> : 'check'}
          disabled={pending}
        />
      </FormGrid>
    );
  }

  return (
    <FormGrid className="m-tag-input">
      <Button className="m-tag-input__button" onClick={handleClickTag}>
        <span className="m-tag-input__text">{getTagLabel(i18n, tag)}</span>
        {/* @ts-ignore */}
        <Icon className="m-tag-input__icon" type="edit" spaced />
      </Button>
      {tag.type === TAG_TYPE_USER && (
        <Button
          className="m-tag-input__delete"
          aria-label={i18n._('settings.tags.action.delete', undefined, {
            defaults: 'Delete',
          })}
          disabled={pending}
          onClick={handleDeleteTag}
          icon={pending ? <Spinner isLoading display="inline" /> : 'remove'}
        />
      )}
      {tagErrors && (
        <FieldErrors errors={tagErrors} className="m-tag-input__errors" />
      )}
    </FormGrid>
  );
}

export default withI18n()(TagInput);
