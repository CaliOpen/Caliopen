import { useQuery, UseQueryResult } from 'react-query';
import { AxiosResponse } from 'axios';
import { APIAxiosError } from 'src/services/api-client/types';
import { TagAPIGetList, TagPayload } from '../types';
import { getQueryKeys, getTagList } from '../query';

type QueryData = AxiosResponse<TagAPIGetList['response']>;
type UseQueryTagsResult = UseQueryResult<QueryData, APIAxiosError>;

const EMPTY_TAG_LIST: TagPayload[] = [];

interface HookRes {
  status: UseQueryTagsResult['status'];
  tags: NonNullable<UseQueryTagsResult['data']>['data']['tags'];
  data: UseQueryTagsResult['data'];
  error: UseQueryTagsResult['error'];
}
export function useTags(): HookRes {
  const { data, error, status } = useQuery<QueryData, APIAxiosError>(
    getQueryKeys(),
    () => getTagList(),
    {
      staleTime: 300000, // 5min
    }
  );

  return {
    status,
    // always return a tag list for convenience, use data instead if needed to test missing data
    tags: data?.data.tags || EMPTY_TAG_LIST,
    data,
    error,
  };
}
