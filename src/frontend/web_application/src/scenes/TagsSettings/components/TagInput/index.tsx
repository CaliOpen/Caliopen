import * as React from 'react';
import { withI18n, withI18nProps } from '@lingui/react';
import { useMutation, useQueryClient } from 'react-query';
import { getTagLabel } from 'src/modules/tags';
import { getQueryKeys, updateTag, deleteTag } from 'src/modules/tags/query';
import { TagPayload } from 'src/modules/tags/types';
import {
  Button,
  Icon,
  Spinner,
  FormGrid,
  FieldErrors,
  TextFieldGroup,
} from 'src/components';
import './style.scss';

const TAG_TYPE_USER = 'user';

type ErrorPayload = { message: string }[];

interface Props extends withI18nProps {
  tag: TagPayload;
}

function TagInput({ i18n, tag }: Props) {
  const [tagLabel, setTagLabel] = React.useState(tag.label);
  const [edit, setEdit] = React.useState(false);
  const [tagErrors, setTagErrors] = React.useState<string[]>([]);

  const queryClient = useQueryClient();
  const {
    mutateAsync: updateTagMutate,
    isLoading: isUpdating,
    error,
  } = useMutation<
    unknown,
    ErrorPayload,
    { value: TagPayload; original: TagPayload }
  >(updateTag, {
    onSuccess: () => {
      queryClient.invalidateQueries(getQueryKeys());
    },
  });
  const { mutateAsync: deleteTagMutate, isLoading: isDeleting } = useMutation<
    unknown,
    ErrorPayload,
    TagPayload
  >(deleteTag, {
    onSuccess: () => {
      queryClient.invalidateQueries(getQueryKeys());
    },
  });

  React.useEffect(() => {
    setTagErrors(error?.map((err) => err.message) || []);
  }, [error]);

  const pending = isUpdating || isDeleting;

  const handleChange = (ev) => {
    setTagLabel(ev.target.value);
    setTagErrors([]);
  };

  const handleClickTag = () => {
    setEdit(true);
  };

  const handleUpdateTag = async () => {
    try {
      await updateTagMutate({
        original: tag,
        value: {
          ...tag,
          label: tagLabel,
        },
      });
    } catch (errors) {
      setTagErrors(errors.map((err) => err.message));
    }

    setEdit(false);
  };

  const handleDeleteTag = async () => {
    try {
      await deleteTagMutate(tag);
    } catch (errors) {
      setTagErrors(errors.map((err) => err.message));
    }
  };

  if (edit) {
    return (
      <FormGrid className="m-tag-input">
        <TextFieldGroup
          id="tag_settings_edit_tag"
          className="m-tag-input__input"
          inputProps={{
            name: tag.name,
            placeholder: getTagLabel(i18n, tag),
            value: tagLabel,
            onChange: handleChange,
            autoFocus: true,
          }}
          label={tag.name}
          showLabelforSr
          errors={tagErrors}
        />
        <Button
          onClick={handleUpdateTag}
          aria-label={i18n._(
            /* i18n */ 'settings.tag.action.save-tag',
            undefined,
            {
              message: 'Save',
            }
          )}
          icon={
            isUpdating ? (
              <Spinner
                svgTitleId="save-tag-spinner"
                isLoading
                display="inline"
              />
            ) : (
              'check'
            )
          }
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
          aria-label={i18n._(
            /* i18n */ 'settings.tags.action.delete',
            undefined,
            {
              message: 'Delete',
            }
          )}
          disabled={pending}
          onClick={handleDeleteTag}
          icon={
            pending ? (
              <Spinner
                svgTitleId="delete-tag-spinner"
                isLoading
                display="inline"
              />
            ) : (
              'remove'
            )
          }
        />
      )}
      {tagErrors && (
        <FieldErrors errors={tagErrors} className="m-tag-input__errors" />
      )}
    </FormGrid>
  );
}

export default withI18n()(TagInput);
