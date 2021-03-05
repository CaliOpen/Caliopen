import { PatchPayload } from 'src/types';
import { ContactCommon } from 'src/modules/contact/types';

// Entity ---------------------------------------
export interface UserPayload {
  user_id: string;
  contact: ContactCommon;
}

export type UserPatchPayload = PatchPayload<UserPayload>;
//  ---------------------------------------------
