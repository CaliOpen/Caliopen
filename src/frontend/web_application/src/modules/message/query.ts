import getClient from 'src/services/api-client';
import { FetchConfig, QueryKey } from 'src/types';
import { TagPayload } from '../tags/types';
import { Message } from './models/Message';

const client = getClient();

export const getQueryKeys = ({
  messageId,
  fetchParams,
}: {
  messageId?: string;
  fetchParams?: any;
} = {}): QueryKey =>
  // @ts-ignore
  [
    'messages',
    messageId,
    fetchParams ? JSON.stringify(fetchParams) : undefined,
  ].filter(Boolean);

export const getConfigUpdateTags = (messageId?: string): FetchConfig => ({
  url: `/api/v2/messages/${messageId}/tags`,
});

// ---------------------------------

export function updateTags(message: Message, tags: TagPayload[]) {
  const payload = {
    tags: tags.map((tag) => tag.name),
    current_state: { tags: message.tags },
  };

  return client.patch(getConfigUpdateTags(message.message_id).url, payload);
}
