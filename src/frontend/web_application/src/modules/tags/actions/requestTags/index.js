// TODO: rm, useless

import { requestTags as requestTagsBase } from '../../store/reducer';

export const requestTags = () => (dispatch) =>
  dispatch(requestTagsBase()).then((response) => response.payload.data.tags);
