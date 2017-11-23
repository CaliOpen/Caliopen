const userUtil = require('../utils/user-util');

describe('Home', () => {
  const EC = protractor.ExpectedConditions;
  const locale = 'en';
  const __ = key => ({
    fr: {
      please_login: 'VOUS POUVEZ VOUS AUTHENTIFIER',
    },
    en: {
      please_login: 'PLEASE LOG IN',
    },
  }[locale][key]);

  describe('Authentication', () => {
    afterEach(() => {
      userUtil.signout();
    });

    it('Log In', () => {
      userUtil.signin();
      browser.get('/');
      expect(element(by.css('.m-application-switcher .m-navbar-item__content')).getText()).toContain('Messages');
    });

    it('Requires authentication', () => {
      browser.get('/');
      browser.wait(EC.presenceOf($('.m-title__text')), 1000);

      expect(element(by.css('.m-title__text')).getText()).toContain(__('please_login'));
    });

    it('Log out', () => {
      userUtil.signin();
      userUtil.signout();
      expect(element(by.css('.m-title__text')).getText()).toContain(__('please_login'));
    });
  });
});
