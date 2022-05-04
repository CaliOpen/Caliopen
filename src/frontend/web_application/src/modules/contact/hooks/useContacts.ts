import { AxiosResponse } from 'axios';
import { useIsFetching, useQuery, UseQueryResult } from 'react-query';
import { flatten } from 'lodash';
import { APIAxiosError } from 'src/services/api-client/types';
import { Contact, GETContactListPayload } from '../types';
import { getAllContactCollection, getConfigList } from '../query';

type UseContactsResult = UseQueryResult<Contact[], APIAxiosError>;

const queryConfig = getConfigList();

/**
 * Load all the contacts (by chunks of 1000) and keep data for 1h.
 */
export function useContacts(): UseContactsResult {
  const result = useQuery<
    AxiosResponse<GETContactListPayload>[],
    APIAxiosError,
    Contact[]
  >(queryConfig.queryKeys, () => getAllContactCollection(), {
    // XXX: The data will not be refetched even after a window focus, it is
    // probably required to invalidate query manually.
    staleTime: 3600000, // 1h
    select: (allPages) =>
      flatten(allPages.map((response) => response.data.contacts)),
  });

  return result;
}

export function useContactsIsFetching(): boolean {
  return useIsFetching(queryConfig.queryKeys) > 0;
}
