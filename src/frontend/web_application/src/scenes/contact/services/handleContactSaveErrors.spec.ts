import {
  handleContactSaveErrors,
  CONTACT_UNKNOWN_ERROR,
  CONTACT_ERROR_ADDRESS_UNICITY_CONSTRAINT,
} from './handleContactSaveErrors';

describe('scene Contact > services > handleContactSaveErrors', () => {
  it('is not an unicity error', () => {
    const axiosError = {
      response: {
        status: 403,
        statusText: 'Forbidden',
        data: {
          errors: [
            {
              code: 403,
              message: '[RESTfacility] PatchContact forbidden',
              name: '',
            },
          ],
        },
      },
    };
    // @ts-ignore
    expect(handleContactSaveErrors(axiosError)).toEqual([
      {
        type: CONTACT_UNKNOWN_ERROR,
      },
    ]);
  });
  it('is a field error ', () => {
    const axiosError = {
      response: {
        status: 422,
        statusText: 'Unprocessable Entity',
        data: {
          errors: [
            {
              code: 602,
              message: 'patch.organizations.name in body is required',
              name: '',
            },
          ],
        },
      },
    };
    // @ts-ignore
    expect(handleContactSaveErrors(axiosError)).toEqual([
      {
        type: CONTACT_UNKNOWN_ERROR,
      },
    ]);
  });

  it('is an unicity error', () => {
    const axiosError = {
      response: {
        // XXX: bad status code at this moment (2019-05-02)
        status: 403,
        statusText: 'Forbidden',
        data: {
          errors: [
            {
              code: 403,
              message: '[RESTfacility] PatchContact forbidden',
              name: '',
            },
            {
              code: 6,
              message:
                '[RESTfacility] PatchContact forbidden : uri <email:contact@foobar.tld> belongs to contact 62844b07-e59f-41e1-b1d6-6dff9dd03710',
              name: '',
            },
            {
              code: 422,
              message:
                'uri <email:contact@foobar.tld> belongs to contact 62844b07-e59f-41e1-b1d6-6dff9dd03710',
              name: '',
            },
          ],
        },
      },
    };
    // @ts-ignore
    expect(handleContactSaveErrors(axiosError)).toEqual([
      {
        type: CONTACT_ERROR_ADDRESS_UNICITY_CONSTRAINT,
        address: 'email:contact@foobar.tld',
        ownerContactId: '62844b07-e59f-41e1-b1d6-6dff9dd03710',
      },
    ]);
  });
});
