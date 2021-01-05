import { createAction, createSelector } from 'bouchon';
import { v1 as uuidv1 } from 'uuid';
import createCollectionMiddleware from '../collection-middleware';

export const actions = {
  get: createAction('Get discussions'),
  create: createAction('create discussion'),
};

const selectors = {
  all: () => (state) => state.discussions,
  byId: ({ discussion_id }) =>
    createSelector(selectors.all(), (discussions) => {
      const discussion = discussions.find(
        (discussion) => discussion.discussion_id === discussion_id
      );
      if (discussion) {
        return discussion;
      }

      throw new Error('discussion not found');
    }),
};

const reducer = {
  [actions.create]: (state, { body, req }) => {
    if (body.discussion_id) {
      return state;
    }

    const discussion = {
      discussion_id: uuidv1(),
      participants: body.participants.map((participant) => ({
        ...participant,
        protocol:
          participant.protocol === 'smtp' ? 'email' : participant.protocol,
      })),
      excerpt: body.body.slice(0, 100), // it works beccause created using POST message route
      privacy_index: 1,
      date_insert: new Date(),
      total_count: 1,
      attachment_count: 0,
      importance_level: 0,
      unread_count: 0,
    };

    // set discussionId for new draft;
    req.discussionId = discussion.discussion_id;

    return [...state, discussion];
  },
};

const routes = {
  'GET /': {
    action: actions.get,
    selector: selectors.all,
    status: 200,
    middlewares: [createCollectionMiddleware('discussions')],
  },
  'GET /:discussion_id': {
    action: actions.get,
    selector: selectors.byId,
    status: 200,
  },
};

export default {
  name: 'discussions',
  data: require('./data.json'),
  reducer: reducer,
  endpoint: '/api/v2/discussions',
  routes: routes,
};
