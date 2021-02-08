import { createAction, createSelector } from 'bouchon';
import { v4 as uuidv4 } from 'uuid';
import createCollectionMiddleware from '../collection-middleware';
import { actions as discussionActions } from '../discussions';

const actions = {
  get: createAction('Get messages'),
  post: createAction('Post message'),
  patch: createAction('Patch message'),
  delete: createAction('Delete message'),
  actions: createAction('Actions message'),
  patchTags: createAction('Patch message\'s tags'),
};

const notifiedMessageIds = '12345'.split('').map((v) => `1aaa-bbbb-000${v}`);

const getMessageFromNotifier = (messageId) => {
  if (notifiedMessageIds.includes(messageId)) {
    const now = new Date();

    return {
      attachments: [],
      body: `notif ${messageId}`,
      excerpt: `notif ${messageId}`,
      date: now.toISOString(),
      date_insert: now.toISOString(),
      date_sort: now.toISOString(),
      discussion_id: 'cd53e13a-267d-4d9c-97ee-d0fc59c64200',
      user_identities: ['aaaa-bbbb-cccc-ddd1'],
      importance_level: 0,
      is_answered: false,
      is_draft: false,
      is_received: false,
      message_id: messageId,
      participants: [{
        address: 'test@caliopen.local',
        label: 'foo',
        protocol: 'email',
        type: 'Cc'
      }, {
        address: 'john@caliopen.local',
        contact_ids: ['c-john-01'],
        label: 'Jaune',
        protocol: 'email',
        type: 'From'
      }, {
        address: 'zoidberg@planet-express.tld',
        contact_ids: ['0ba2e346-e4f8-4c45-9adc-eeb1d42fuie0'],
        label: 'zoidberg',
        protocol: 'email',
        type: 'To'
      }],
    };
  }

  return undefined;
}


const selectors = {
  all: () => state => state.messages,
  last: () => state => [...state.messages].pop(),
  byQuery: ({ offset = 0, limit = 20, discussion_id, is_draft, is_received }) => createSelector(
    [discussion_id ? selectors.byDiscussionId({ discussion_id }) :  selectors.all()],
    messages => {
      const end = new Number(offset) + new Number(limit);
      return messages.filter(message => {
        if (is_draft !== undefined && message.is_draft.toString() !== is_draft) {
          return false;
        }
        if (is_received !== undefined && message.is_received.toString() !== is_received) {
          return false;
        }
        return true;
      }).slice(offset, end);
    }
  ),
  byDiscussionId: ({ discussion_id }) => createSelector(
    selectors.all(),
    messages => messages.filter(message => message.discussion_id === discussion_id)
  ),
  lastLocation: () => createSelector(
    selectors.last(),
    message => ({ location: `/api/v2/messages/${message.message_id}` })
  ),
  byId: ({ message_id }) => createSelector(
    selectors.all(),
    messages => {
      let result = messages.find(message => message.message_id === message_id);

      if (!result) {
        result = getMessageFromNotifier(message_id);
      }

      return result;
    }
  ),
};

const filterAuthor = participants => participants.filter(participant => participant.type !== 'From');
const reduceParticipants = message => [
  ...(message.participants ? filterAuthor(message.participants) : []),
  {
    address: 'john@caliopen.local',
    contact_ids: ['c-john-01'],
    label: 'Jaune john',
    protocol: 'email',
    type: 'From'
  },
];

const reducer = {
  [actions.get]: state => state.sort((a, b) => new Date(b.date_sort) - new Date(a.date_sort)),
  [actions.post]: (state, { body, req: { discussionId } }) => ([
    ...state,
    {
      discussion_id: discussionId,
      ...body,
      excerpt: body.body.slice(0, 30) + '...',
      message_id: body.message_id || uuidv4(),
      is_draft: true,
      is_unread: false,
      is_received: false,
      date: Date.now(),
      date_insert: Date.now(),
      date_sort: Date.now(),
      pi: { technic: 50, context: 45, comportment: 25, version: 1 },
      pi_message: { transport: 50, content: 45, social: 25 },
      participants: reduceParticipants(body),
    },
  ]),
  [actions.patch]: (state, { params, body }) => {
    const nextState = [...state];
    const original = state.find(message => message.message_id === params.message_id);
    if (!original) {
      throw `message w/ id ${params.message_id} not found`;
    }
    const index = nextState.indexOf(original);
    const { current_state, ...props } = body;
    nextState[index] = {
      ...original,
      ...props,
      participants: state[index].is_draft ? reduceParticipants(props) : nextState[index].participants,
    };

    return nextState;
  },
  [actions.delete]: (state, { params, body }) => {
    const original = state.find(message => message.message_id === params.message_id);
    if (!original) {
      throw `message w/ id ${params.message_id} not found`;
    }

    return [...state.filter(message => message.message_id !== params.message_id)];
  },
  [actions.patchTags]: (state, { params, body }) => {
    const original = state.find(message => message.message_id === params.message_id);
    if (!original) {
      throw `message w/ id ${params.message_id} not found`;
    }

    const index = state.indexOf(original);
    const nextState = [...state];
    const { tags } = body;

    nextState[index] = {
      ...original,
      tags,
    };

    return nextState;
  },
  [actions.actions]: (state, { params, body }) => {
    const original = state.find(message => message.message_id === params.message_id);
    if (!original) {
      throw `message w/ id ${params.message_id} not found`;
    }
    const index = state.indexOf(original);

    return body.actions.reduce((acc, action) => {
      switch (action) {
        case 'send':
          acc[index] = { ...acc[index], is_draft: false, date: Date.now() };

          return acc;
        case 'set_read':
          acc[index] = { ...acc[index], is_unread: false };

          return acc;
        case 'set_unread':
          acc[index] = { ...acc[index], is_unread: true };

          return acc;
        default:
          throw new Error(`Unexpected action "${action}"`);
      }
    }, [...state]);
  },
};

const routes = {
  'GET /v2/messages/': {
    action: actions.get,
    selector: selectors.byQuery,
    status: 200,
    middlewares: [createCollectionMiddleware('messages')],
  },
  'GET /v2/messages/:message_id': {
    action: actions.get,
    selector: selectors.byId,
    status: 200,
    middlewares: [data => (req, res, next) => {
      if (!data) {
        res.status(404);
      }
    }],
  },
  'DELETE /v1/messages/:message_id': {
    action: actions.delete,
    status: 204,
  },
  'POST /v2/messages/:message_id/actions': {
    action: actions.actions,
    selector: selectors.byId,
    status: 200,
  },
  'PATCH /v2/messages/:message_id/tags': {
    action: actions.patchTags,
    status: 204,
  },
  'POST /v1/messages/': {
    action: [discussionActions.create, actions.post],
    selector: selectors.lastLocation,
    status: 200,
  },
  'PATCH /v1/messages/:message_id': {
    action: actions.patch,
    status: 204,
  },
};

export default {
  name: 'messages',
  data: require('./data.json'),
  reducer: reducer,
  endpoint: '/api',
  routes: routes,
};
