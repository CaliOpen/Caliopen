import { AxiosError } from 'axios';

export const CONTACT_ERROR_ADDRESS_UNICITY_CONSTRAINT =
  'address_unicity_constraint';
export const CONTACT_UNKNOWN_ERROR = 'unknown_error';

// eslint-disable-next-line prefer-regex-literals
const UNICITY_PARSE_EXPR = new RegExp(
  /^uri <(.*)> belongs to contact ([a-f0-9\\-]+)$/
);

interface APIErrorResponse {
  errors: { message: string }[];
}

interface FieldError {
  type: string;
}
export interface ContactError {
  type: typeof CONTACT_ERROR_ADDRESS_UNICITY_CONSTRAINT;
  address: string;
  ownerContactId: string;
}
export type ContactErrors = (ContactError | FieldError)[];

export const handleContactSaveErrors = (
  axiosResponse: AxiosError<APIErrorResponse>
): ContactErrors | undefined =>
  axiosResponse?.response?.data?.errors?.reduce((acc, err, index, arr) => {
    const unicityConstraintError = UNICITY_PARSE_EXPR.exec(err.message);

    if (unicityConstraintError) {
      return [
        ...acc,
        {
          type: CONTACT_ERROR_ADDRESS_UNICITY_CONSTRAINT,
          address: unicityConstraintError[1],
          ownerContactId: unicityConstraintError[2],
        },
      ];
    }

    if (arr.length - 1 === index && Object.keys(acc).length === 0) {
      return [{ type: CONTACT_UNKNOWN_ERROR }];
    }

    return acc;
  }, []);
