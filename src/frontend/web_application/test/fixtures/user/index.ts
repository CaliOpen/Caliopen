import { UserPayload } from 'src/modules/user/types';

import data from './data.json';

export function generateUser(props: Partial<UserPayload>): UserPayload {
  return {
    ...data,
    ...props,
  };
}
