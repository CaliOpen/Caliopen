const userUtil = require('../utils/user-util');

describe('Settings', () => {
  const EC = protractor.ExpectedConditions;

  beforeAll(async () => {
    await userUtil.signin();
  });

  it('Display form', async () => {
    await userUtil.showSettings('Application');
    await browser.wait(EC.presenceOf($('.l-settings')), 5 * 1000);
    await expect(
      element.all(by.css('.m-section__title')).first().getText()
    ).toEqual('Customize your interface');
    await expect(
      element(by.cssContainingText('.m-button', 'Save settings')).isPresent()
    ).toBe(true);
  });
});
