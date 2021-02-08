import getClient from '../../../../services/api-client';

export const signup = (params) => getClient().post('/auth/signup', params);
