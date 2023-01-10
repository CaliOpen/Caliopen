import getClient from 'src/services/api-client';
import { Discussion } from 'src/store/modules/discussion';
import { FetchConfig, QueryKey } from 'src/types';
import { TagPayload } from '../tags/types';

const client = getClient();

export const getQueryKeys = ({
  discussionId,
  fetchParams,
}: {
  discussionId?: string;
  fetchParams?: any;
} = {}): QueryKey =>
  // @ts-ignore
  [
    'discussions',
    discussionId,
    fetchParams ? JSON.stringify(fetchParams) : undefined,
  ].filter(Boolean);

export const getConfigUpdateTags = (discussionId?: string): FetchConfig => ({
  url: `/api/v2/discussions/${discussionId}/tags`,
});

// ---------------------------------

export function updateTags(discussion: Discussion, tags: TagPayload[]) {
  const payload = {
    tags: tags.map((tag) => tag.name),
    current_state: { tags: discussion.tags },
  };

  return client.patch(getConfigUpdateTags(discussion.id).url, payload);
}
