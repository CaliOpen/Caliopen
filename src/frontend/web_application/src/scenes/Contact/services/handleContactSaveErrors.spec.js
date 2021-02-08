import {
  handleContactSaveErrors,
  CONTACT_UNKNOWN_ERROR,
  CONTACT_ERROR_ADDRESS_UNICITY_CONSTRAINT,
} from './handleContactSaveErrors';

describe('scene Contact -- services -- handleContactSaveErrors', () => {
  it('throws not handled error', () => {
    const customError = new Error('custom error');
    try {
      expect(handleContactSaveErrors(customError)).toEqual('not called');
    } catch (e) {
      expect(e).toBe(customError);
    }
  });

  it('throw an Error when nothing', () => {
    const customError = undefined;
    try {
      expect(handleContactSaveErrors(customError)).toEqual('not called');
    } catch (e) {
      expect(e).toBeInstanceOf(Error);
    }
  });

  it('is not an unicity error', () => {
    const axiosError = {
      type: 'co/contact/UPDATE_CONTACT_FAIL',
      error: {
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
      },
    };
    expect(handleContactSaveErrors(axiosError)).toEqual([
      {
        type: CONTACT_UNKNOWN_ERROR,
      },
    ]);
  });

  it('is an unicity error', () => {
    const axiosError = {
      type: 'co/contact/UPDATE_CONTACT_FAIL',
      error: {
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
      },
    };
    expect(handleContactSaveErrors(axiosError)).toEqual([
      {
        type: CONTACT_ERROR_ADDRESS_UNICITY_CONSTRAINT,
        address: 'email:contact@foobar.tld',
        ownerContactId: '62844b07-e59f-41e1-b1d6-6dff9dd03710',
      },
    ]);
  });
});
