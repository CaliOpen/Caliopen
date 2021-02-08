export const CONTACT_ERROR_ADDRESS_UNICITY_CONSTRAINT =
  'address_unicity_constraint';
export const CONTACT_UNKNOWN_ERROR = 'unknown_error';

const UNICITY_PARSE_EXPR = new RegExp(
  /^uri <(.*)> belongs to contact ([a-f0-9\\-]+)$/
);

export const handleContactSaveErrors = (axiosResponse) => {
  if (!axiosResponse) {
    throw new Error('not an error');
  }

  if (
    !axiosResponse.error ||
    !axiosResponse.error.response ||
    !axiosResponse.error.response.data
  ) {
    console.warn(
      'not an axios response and should not be handled by `handleContactSaveError`'
    );

    throw axiosResponse;
  }

  return axiosResponse.error.response.data.errors.reduce(
    (acc, err, index, arr) => {
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

      if (arr.length - 1 === index && acc.length === 0) {
        return [{ type: CONTACT_UNKNOWN_ERROR }];
      }

      return acc;
    },
    []
  );
};
