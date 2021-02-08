import { requestTags as requestTagsBase } from '../../../../store/modules/tag';

export const requestTags = () => (dispatch) =>
  dispatch(requestTagsBase()).then((response) => response.payload.data.tags);
