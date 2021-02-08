import {
  TIMELINE_FILTER_ALL,
  TIMELINE_FILTER_RECEIVED,
  TIMELINE_FILTER_SENT,
  TIMELINE_FILTER_DRAFT,
  setTimelineFilter,
  requestMessages,
} from '../modules/message';

const getQuery = (type) => {
  switch (type) {
    default:
    case TIMELINE_FILTER_ALL:
      return {};
    case TIMELINE_FILTER_SENT:
      return { is_received: false, is_draft: false };
    case TIMELINE_FILTER_RECEIVED:
      return { is_received: true };
    case TIMELINE_FILTER_DRAFT:
      return { is_draft: true };
  }
};

export const filterTimeline = (type) => (dispatch) => {
  dispatch(setTimelineFilter(type));

  return dispatch(requestMessages('timeline', type, getQuery(type)));
};
