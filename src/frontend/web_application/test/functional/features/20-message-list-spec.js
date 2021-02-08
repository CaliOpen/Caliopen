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
    // await filter('All');
    await browser.wait(
      EC.presenceOf($('.s-timeline .s-discussion-item')),
      5 * 1000
    );
    await element(
      by.cssContainingText(
        '.s-discussion-item__message_excerpt',
        "Fry! Stay back! He's too powerful!"
      )
    ).click();
    await browser.wait(EC.presenceOf($('.s-discussion')), 5 * 1000);
    console.log('wait success for .m-message');
    expect(element.all(by.css('article')).count()).toEqual(2);
  });

  it('Does not display "Load More" on complete discussion', async () => {
    // await filter('All');
    await browser.wait(
      EC.presenceOf($('.s-timeline .s-discussion-item')),
      5 * 1000
    );
    await element(
      by.cssContainingText(
        '.s-discussion-item__message_excerpt',
        "Fry! Stay back! He's too powerful!"
      )
    ).click();
    expect(element.all(by.css('m-message-list__load-more')).count()).toEqual(0);
  });
});
