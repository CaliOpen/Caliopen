import { createApi } from '@rtk-incubator/rtk-query/react';
import calcObjectForPatch from 'src/services/api-patch';
import { TagAPIPostPayload, TagPayload } from '../types';
import { fetchQuery } from 'src/services/api-client/index';
import { invalidate } from 'src/modules/contact/store';

interface TagsAPIResult {
  tags: TagPayload[];
}

interface TagAPIPostResult {
  Location: string;
}

type TagAPIPatchResult = never;

// type TagAPIDeleteResult = never;
type TagAPIDeleteResult = {
  foo: string;
};

interface UpdateTagArg {
  original: TagPayload;
  tag: TagPayload;
}

type DeleteTagArg = TagPayload;

const entityTypes = ['Tag'];

export const tagsApi = createApi({
  reducerPath: 'tagsApi',
  entityTypes,
  baseQuery: fetchQuery({}),
  endpoints: (builder) => ({
    getTags: builder.query<TagsAPIResult, void>({
      query: () => '/api/v2/tags',
      providesTags: entityTypes,
    }),
    createTag: builder.mutation<TagAPIPostResult, TagAPIPostPayload>({
      query: (body) => ({
        url: '/api/v2/tags',
        method: 'POST',
        body,
      }),
      invalidatesTags: entityTypes,
    }),
    updateTag: builder.mutation<TagAPIPatchResult, UpdateTagArg>({
      query: ({ original, tag }) => ({
        url: `/api/v2/tags/${original.name}`,
        method: 'PATCH',
        body: calcObjectForPatch(tag, original),
      }),
      invalidatesTags: entityTypes,
      onSuccess: (arg, api) => {
        api.dispatch(invalidate());
      },
    }),
    deleteTag: builder.mutation<TagAPIDeleteResult, DeleteTagArg>({
      query: (tag) => ({
        url: `/api/v2/tags/${tag.name}`,
        method: 'DELETE',
      }),
      invalidatesTags: entityTypes,
      onSuccess: (arg, api) => {
        api.dispatch(invalidate());
      },
    }),
  }),
});

export const {
  useGetTagsQuery,
  useCreateTagMutation,
  useUpdateTagMutation,
  useDeleteTagMutation,
} = tagsApi;
