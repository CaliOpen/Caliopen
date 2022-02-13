import { PatchPayload } from 'src/types';
import { ContactPayload } from 'src/modules/contact/types';
import { PI, PrivacyFeature } from 'src/modules/pi/types';

// Entity ---------------------------------------
export interface UserPayload {
  contact: ContactPayload;
  date_insert?: string; // format: date-time
  family_name?: string;
  given_name?: string;
  name?: string;
  password?: string;
  params?: Record<string, unknown>;
  privacy_features?: PrivacyFeature;
  pi?: PI;
  user_id: string;
  recovery_email?: string;
}

export type UserPatchPayload = PatchPayload<UserPayload>;
//  ---------------------------------------------
