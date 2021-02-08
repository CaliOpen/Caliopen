const userUtil = require('../utils/user-util');

describe('Home', () => {
  const EC = protractor.ExpectedConditions;

  describe('Authentication', () => {
    afterEach(() => {
      userUtil.signout();
    });

    it('Log In', async () => {
      await userUtil.signin();
      expect(
        element(by.css('.m-application-tab [title=Timeline]')).isPresent()
      ).toEqual(true);
    });

    it('Requires authentication', async () => {
      browser.get('/');
      await browser.wait(
        EC.presenceOf(element(by.css('.s-signin__action'))),
        1000
      );

      expect(
        element(by.css('.s-signin__action .m-button')).getText()
      ).toContain('Login');
    });

    it('Log out', async () => {
      await userUtil.signin();
      await userUtil.signout();
      await browser.wait(
        EC.presenceOf(element(by.css('.s-signin__action'))),
        1000
      );

      expect(
        element(by.css('.s-signin__action .m-button')).getText()
      ).toContain('Login');
    });
  });

  it('Page not found', async () => {
    await userUtil.signin();
    await browser.get('/whatever');
    await browser.wait(
      EC.presenceOf(element(by.css('.s-page-not-found'))),
      5 * 1000
    );

    expect(element(by.css('.s-page-not-found__title')).isPresent()).toEqual(
      true
    );
  });
});
