import axios from 'axios';

export const checkAvailability = async (username: string) => {
  const response = await axios.get('/api/v2/username/isAvailable', {
    params: { username },
    headers: { 'X-Requested-With': 'XMLHttpRequest' },
  });
  return response.data.available;
};
