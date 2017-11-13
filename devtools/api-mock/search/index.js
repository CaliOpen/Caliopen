import { createAction, createSelector } from 'bouchon';
import { v1 as uuidv1 } from 'uuid';
import createCollectionMiddleware from '../collection-middleware';

const actions = {
};

const match = ({ item, props, searchTerms }) => props.find(propName =>
      item[propName] && item[propName].toLowerCase().includes(searchTerms.toLowerCase()));

const selectors = {
  all: () => state => state.search,
};

const reducer = {
};

const routes = {
  'GET /': {
    selector: selectors.all,
    status: 200,
  },
};

export default {
  name: 'search',
  data: require('./data.json'),
  reducer: reducer,
  endpoint: '/api/v2/search',
  routes: routes,
};
