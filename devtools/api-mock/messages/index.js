import { createAction, createSelector } from 'bouchon';
import { v1 as uuidv1 } from 'uuid';
import createCollectionMiddleware from '../collection-middleware';
import { actions as discussionActions } from '../discussions';

const actions = {
  get: createAction('Get messages'),
  post: createAction('Post message'),
  patch: createAction('Patch message'),
  delete: createAction('Delete message'),
  actions: createAction('Actions message'),
};

const selectors = {
  all: () => state => state.messages,
  last: () => state => [...state.messages].pop(),
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
    messages => messages.find(message => message.message_id === message_id)
  ),
};

const filterAuthor = participants => participants.filter(participant => participant.type !== 'From');
const reduceParticipants = message => [
  ...(message.participants ? filterAuthor(message.participants) : []),
  {
    address: 'john@caliopen.local',
    contact_ids: ['1039cdcc-1f6f-4b5d-9c8a-5d7c711f357f'],
    label: 'Jaune john',
    protocol: 'email',
    type: 'From'
  },
];

const reducer = {
  [actions.get]: state => state,
  [actions.post]: (state, { body, req: { discussionId } }) => ([
    ...state,
    {
      discussion_id: discussionId,
      ...body,
      message_id: uuidv1(),
      is_draft: true,
      is_unread: false,
      date: Date.now(),
      date_insert: Date.now(),
      pi: { technic: 50, context: 45, comportment: 25, version: 1 },
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
    selector: selectors.byDiscussionId,
    status: 200,
    middlewares: [createCollectionMiddleware('messages')],
  },
  'GET /v2/messages/:message_id': {
    action: actions.get,
    selector: selectors.byId,
    status: 200,
  },
  'DELETE /v1/messages/:message_id': {
    action: actions.delete,
    selector: selectors.byId,
    status: 204,
  },
  'POST /v2/messages/:message_id/actions': {
    action: actions.actions,
    selector: selectors.byId,
    status: 200,
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
