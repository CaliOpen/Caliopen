const EC = protractor.ExpectedConditions;

module.exports = {
  signin: async (login, password) => {
    const loginKeys = login || 'dev';
    const passwordKeys = password || '123456';

    await browser.get('/auth/signin');
    await element(by.css('input[name=username]')).sendKeys(loginKeys);
    await element(by.css('input[name=password]')).sendKeys(passwordKeys);
    await element(by.cssContainingText('button[type=submit]', 'Login')).click();

    return browser.wait(EC.presenceOf(element(by.css('.l-header__brand'))), 5 * 1000);
  },
  signout: () => { browser.get('/auth/signout'); },
  showAccount: () => {
    const userMenu = element(by.css('.l-header__user'));
    userMenu.element(by.css('.m-user-menu__dropdown-control')).click();
    userMenu.element(by.cssContainingText('.m-link', 'Account')).click();
    userMenu.element(by.css('.m-user-menu__dropdown-control')).click();

    return browser.wait(EC.urlContains('user/profile'), 5 * 1000);
  },
  showSettings: (pageName = null) => element(by.css('.m-user-menu .m-dropdown__trigger')).click()
    .then(() => element(by.cssContainingText('.m-user-menu .m-link', 'Settings')).click())
    .then(() => {
      if (!pageName) {
        return undefined;
      }

      return element(by.cssContainingText('.l-settings__menu-bar .m-nav-list .m-link', pageName)).click();
    }),
};
