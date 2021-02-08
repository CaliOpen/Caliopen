import getClient from '../../../services/api-client';

export const getProvider = ({ providerName, identifier }) =>
  getClient()
    .get(
      `/api/v2/providers/${providerName}?identifier=${encodeURIComponent(
        identifier
      )}`
    )
    .then((payload) => payload.data);
