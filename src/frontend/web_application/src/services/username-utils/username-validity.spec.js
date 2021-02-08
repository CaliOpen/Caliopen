import Schema from 'async-validator';
import descriptor from './username-validity';

describe('services username-utils username-validity', () => {
  const validator = new Schema(descriptor);

  const validate = (username) =>
    new Promise((resolve, reject) => {
      validator.validate({ username }, (errors, fields) => {
        if (errors) {
          return reject({ errors, fields });
        }

        return resolve(true);
      });
    });

  const unexpectedValid = () => expect(true).toBe(false);
  const expectTrue = (res) => expect(res).toBe(true);
  const expectOneError = (res) => expect(res.errors.length).toEqual(1);

  describe('isValid', () => {
    it('not valid under 3 characters & after 42 characters', async () => {
      try {
        await validate('aa');
        unexpectedValid();
      } catch (e) {
        expectOneError(e);
      }

      try {
        await validate('aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa');
        unexpectedValid();
      } catch (e) {
        expectOneError(e);
      }
    });

    it('valid with 3 characters', async () => {
      let isValid = await validate('aaa');
      expectTrue(isValid);
      isValid = await validate('a.b');
      expectTrue(isValid);
    });

    it('valid with alphabet', async () => {
      const isValid = await validate('thequickbrownfoxjumpsoverthelazydog');
      expectTrue(isValid);
    });

    it('valid with capital', async () => {
      let isValid = await validate('AbcD');
      expectTrue(isValid);
      isValid = await validate('ABCD');
      expectTrue(isValid);
      isValid = await validate('AbCd');
      expectTrue(isValid);
    });

    it('not valid with spaces', async () => {
      try {
        await validate('Ab cD');
        unexpectedValid();
      } catch (e) {
        expectOneError(e);
      }
      try {
        await validate('A bc D');
        unexpectedValid();
      } catch (e) {
        expectOneError(e);
      }
      try {
        await validate(' AbcD ');
        unexpectedValid();
      } catch (e) {
        expectOneError(e);
      }
      try {
        await validate('Ab  cD');
        unexpectedValid();
      } catch (e) {
        expectOneError(e);
      }
    });

    it('valid with some specials characters', async () => {
      let isValid = await validate('aa.b');
      expectTrue(isValid);
      isValid = await validate('b-b');
      expectTrue(isValid);
      isValid = await validate('été');
      expectTrue(isValid);
      isValid = await validate('test+à');
      expectTrue(isValid);
      isValid = await validate('❤κξαδιθροχ');
      expectTrue(isValid);
      isValid = await validate('名無しの権兵衛');
      expectTrue(isValid);
      isValid = await validate(')-oꞁꞁǝH');
      expectTrue(isValid);
    });

    // XXX : requires better regex
    // it('not valid with unicode combining characters', async () => {
    //   try {
    //     await validate('e\u0301te\u0301'); // été
    //     unexpectedValid();
    //   } catch (e) {
    //     expectOneError(e);
    //   }
    // });

    it('not valid with starting & ending dot', async () => {
      try {
        await validate('.abcd');
        unexpectedValid();
      } catch (e) {
        expectOneError(e);
      }
      try {
        await validate('abcd.');
        unexpectedValid();
      } catch (e) {
        expectOneError(e);
      }
    });

    it('not valid with double dot', async () => {
      try {
        await validate('ab..cd');
        unexpectedValid();
      } catch (e) {
        expectOneError(e);
      }
    });

    it('not valid with not compliant email local-part', async () => {
      try {
        await validate('abc"d');
        unexpectedValid();
      } catch (e) {
        expectOneError(e);
      }
      try {
        await validate('abc@d');
        unexpectedValid();
      } catch (e) {
        expectOneError(e);
      }
      try {
        await validate('abc`d');
        unexpectedValid();
      } catch (e) {
        expectOneError(e);
      }
      try {
        await validate('abc:d');
        unexpectedValid();
      } catch (e) {
        expectOneError(e);
      }
      try {
        await validate('abc;d');
        unexpectedValid();
      } catch (e) {
        expectOneError(e);
      }
      try {
        await validate('abc<d');
        unexpectedValid();
      } catch (e) {
        expectOneError(e);
      }
      try {
        await validate('abc>d');
        unexpectedValid();
      } catch (e) {
        expectOneError(e);
      }
      try {
        await validate('abc[d');
        unexpectedValid();
      } catch (e) {
        expectOneError(e);
      }
      try {
        await validate('abc]d');
        unexpectedValid();
      } catch (e) {
        expectOneError(e);
      }
      try {
        await validate('abc\\d');
        unexpectedValid();
      } catch (e) {
        expectOneError(e);
      }
    });
  });
});
