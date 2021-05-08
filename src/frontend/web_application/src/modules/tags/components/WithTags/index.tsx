import * as React from 'react';
import { useGetTagsQuery } from '../../store';
import { TagPayload } from '../../types';

interface WithTagsProps {
  render: (tag: TagPayload[]) => React.ReactNode;
}

const EMPTY_ARRAY: TagPayload[] = [];
export default function WithTags({ render }: WithTagsProps) {
  const { data: { tags } = { tags: EMPTY_ARRAY } } = useGetTagsQuery();

  return render(tags);
}
