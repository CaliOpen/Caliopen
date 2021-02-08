const EC = protractor.ExpectedConditions;

module.exports = {
  signin: async (login, password) => {
    const loginKeys = login || 'dev';
    const passwordKeys = password || '123456';

    const url = await browser.getCurrentUrl();

    if (!url.includes('/auth/signin')) {
      await browser.get('/auth/signin');
    }
    await element(by.css('input[name=username]')).sendKeys(loginKeys);
    await element(by.css('input[name=password]')).sendKeys(passwordKeys);
    await element(by.cssContainingText('button[type=submit]', 'Login')).click();

    return browser.wait(
      EC.presenceOf(element(by.css('.l-header__brand'))),
      5 * 1000
    );
  },
  signout: () => {
    browser.get('/auth/signout');
  },
  showAccount: async (pageName) => {
    const userMenu = element(by.css('.l-header__user-menu'));
    userMenu.element(by.css('.m-button')).click();
    userMenu.element(by.cssContainingText('.m-link', 'Account')).click();
    userMenu.element(by.css('.m-button')).click();

    const result = await browser.wait(EC.urlContains('user/profile'), 5 * 1000);

    if (pageName) {
      return element(
        by.cssContainingText('.l-user .m-nav-list .m-link', pageName)
      ).click();
    }

    return result;
  },
  showSettings: (pageName = null) =>
    element(by.css('.m-user-menu .m-button'))
      .click()
      .then(() =>
        element(
          by.cssContainingText('.m-user-menu .m-link', 'Settings')
        ).click()
      )
      .then(() => {
        if (!pageName) {
          return undefined;
        }

        return element(
          by.cssContainingText('.l-settings .m-nav-list .m-link', pageName)
        ).click();
      }),
};
