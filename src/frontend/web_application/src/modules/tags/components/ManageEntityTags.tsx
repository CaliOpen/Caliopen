import * as React from 'react';
import { useMutation, useQueryClient } from 'react-query';
import { useLingui } from '@lingui/react';
import TagsForm from './TagsForm';
import { getCleanedTagCollection } from '../services/getTagLabel';
import { useTags } from '../hooks/useTags';
import { Entity, EntityType, NewTag, TagPayload } from '../types';
import { updateTagCollection } from '../query';

interface Props {
  type: EntityType;
  entity: Entity;
  onSuccessChange?: () => void;
}

const EMPTY_ARRAY = [];

function ManageEntityTags({
  entity,
  type,
  onSuccessChange,
}: Props): React.ReactElement<typeof TagsForm> {
  const { tags } = useTags();
  const { i18n } = useLingui();
  const queryClient = useQueryClient();
  const updateTags = React.useCallback(
    (nextTags: (NewTag | TagPayload)[]) =>
      updateTagCollection(i18n, queryClient, {
        type,
        entity,
        tags: nextTags,
      }),
    [type, entity]
  );

  const { mutateAsync } = useMutation<unknown, unknown, TagPayload[]>(
    updateTags,
    {
      onSuccess: onSuccessChange,
    }
  );

  return (
    <TagsForm
      initialTags={
        !entity || !entity.tags
          ? EMPTY_ARRAY
          : getCleanedTagCollection(tags, entity.tags)
      }
      onSubmit={mutateAsync}
    />
  );
}

export default ManageEntityTags;
