const userUtil = require('../utils/user-util');
const { home } = require('../utils/navigation');
const { filter } = require('../utils/timeline');

describe('Message list', () => {
  const EC = protractor.ExpectedConditions;

  beforeAll(async () => {
    await userUtil.signin();
  });

  beforeEach(async () => {
    await home();
  });

  it('List', async () => {
    await filter('All');
    await browser.wait(EC.presenceOf($('.s-timeline .s-message-item')), 5 * 1000);
    await element(by.cssContainingText(
      '.s-timeline .s-message-item .s-message-item__title .s-message-item__excerpt',
      'Fry! Stay back! He\'s too powerful!'
    )).click();
    await browser.wait(EC.presenceOf($('.m-message')), 5 * 1000);
    console.log('wait success for .m-message');
    expect(element.all(by.css('.m-message')).count()).toEqual(2);
  });
});
