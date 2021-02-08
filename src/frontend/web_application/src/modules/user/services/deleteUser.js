import getClient from '../../../services/api-client';

export const deleteUser = async ({ user, password }) => {
  try {
    return await getClient().post(`/api/v2/users/${user.user_id}/actions`, {
      actions: ['delete'],
      params: { password },
    });
  } catch (err) {
    if (err && err.response && err.response.data && err.response.data.errors) {
      return Promise.reject(err.response.data.errors);
    }

    return Promise.reject(err);
  }
};
