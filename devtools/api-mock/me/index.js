import { createAction, createSelector } from 'bouchon';

const actions = {
  get: createAction('me'),
  patch: createAction('patch'),
  actions: createAction('actions'),
};

const selectors = {
  all: () => state => state.me,
};

const reducer = {
  [actions.get]: state => state,
};

const routes = {
  'GET /v1/me/': {
    action: actions.get,
    selector: selectors.all,
    status: 200,
  },
  'PATCH /v2/users/:user_id/': {
    action: actions.patch,
    status: 204,
  },
  'POST /v2/users/:user_id/actions': {
    action: actions.actions,
    status: 204,
    middlewares: [data => (req, res, next) => {
      if (req.body.params.password !== '123456') {
        res.status(424);
        res.data = { errors: [{ message: '[RESTfacility] DeleteUser Wrong password' }]}
      }
      next();
    }],
  },
};

export default {
  name: 'me',
  data: require('./data.json'),
  reducer: reducer,
  endpoint: '/api',
  routes: routes,
};
