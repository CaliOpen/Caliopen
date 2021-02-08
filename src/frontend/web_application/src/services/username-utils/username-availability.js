import axios from 'axios';

const checkAvailability = (username) =>
  axios
    .get(
      '/api/v2/username/isAvailable',
      {
        params: { username },
      },
      {
        headers: { 'X-Requested-With': 'XMLHttpRequest' },
      }
    )
    .then((response) => response.data.available);

export default checkAvailability;
