import { AxiosError, AxiosRequestConfig } from 'axios';

import configureAppStore from './store/configure-store';
import { RootState } from './store/reducer';

// redux ----------------------------------------

export type AppDispatch = ReturnType<typeof configureAppStore>['dispatch'];
export type GetState = () => RootState;

export interface AxiosActionPayload<P = any, D = any> {
  request: {
    url: string;
    method?: 'get' | 'patch' | 'delete';
    params?: P;
    data?: D;
  };
}

// XXX: not sure about that
export type AxiosActionError = AxiosError;

//  ---------------------------------------------

// fetch ----------------------------------------

export interface PagerParams {
  offset?: number;
  limit?: number;
}

export type PatchPayload<
  E extends { [key: string]: any } = Record<string, unknown>
> = Partial<E> & {
  current_state: Partial<E>;
};

export type ResourceStatus =
  | 'idle'
  | 'pending'
  | 'resolved'
  | 'rejected'
  | 'invalidated';

//  ---------------------------------------------

// react-query ----------------------------------

// force some reasons, QueryKey from react-query is hard to use (see if solved with rq4)
export type QueryKey = string[] | string;

export interface MutateConfig {
  url: string;
}

export interface FetchConfig {
  url: string;
  fetchParams?: Record<string, string | number>;
}

export interface QueryConfig extends FetchConfig {
  queryKeys: QueryKey;
}

//  ---------------------------------------------
