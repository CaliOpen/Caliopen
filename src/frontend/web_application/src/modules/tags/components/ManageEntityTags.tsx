import * as React from 'react';
import TagsForm from './TagsForm';
import { getCleanedTagCollection } from '../services/getTagLabel';
import { useTags } from '../hooks/useTags';

type TagsFormProps = React.ComponentProps<typeof TagsForm>;

interface Entity {
  tags?: string[];
}

interface Props {
  entity: Entity;
  onChange: TagsFormProps['updateTags'];
}

const EMPTY_ARRAY = [];

function ManageEntityTags({
  entity,
  onChange,
}: Props): React.ReactElement<typeof TagsForm> {
  const { tags } = useTags();

  return (
    <TagsForm
      tagCollection={
        !entity || !entity.tags
          ? EMPTY_ARRAY
          : getCleanedTagCollection(tags, entity.tags)
      }
      updateTags={onChange}
    />
  );
}

export default ManageEntityTags;
