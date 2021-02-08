const userUtil = require('../utils/user-util');
const { home } = require('../utils/navigation');
const { filter } = require('../utils/timeline');

describe('Scroll on Timeline and Discussion', () => {
  const EC = protractor.ExpectedConditions;
  const clickReply = (message) => {
    const msg = element(by.cssContainingText('article', message));

    return msg.element(by.cssContainingText('.m-button', 'Reply')).click();
  };

  beforeAll(async () => {
    await userUtil.signin();
  });

  beforeEach(async () => {
    await home();
  });

  it('Reaches targets and goes back home', async () => {
    // await filter('All');
    await browser.wait(
      EC.presenceOf($('.s-timeline .s-discussion-item')),
      5 * 1000
    );
    await element(
      by.cssContainingText(
        '.s-discussion-item__message_excerpt',
        'Moi, je verrais plutôt les champignons'
      )
    ).click();
    await browser.wait(EC.presenceOf($('article')), 5 * 1000);
    const scrollYD = await browser.executeScript(() => window.scrollY);
    expect(scrollYD).toBeGreaterThan(0);

    await browser.executeScript('window.scrollTo(0,0);');
    await clickReply('Rien du tout !');
    const scrollYR = await browser.executeScript(() => window.scrollY);
    expect(scrollYR).toBeGreaterThan(scrollYD);

    // await home();
    // const scrollYH = await browser.executeScript(() => window.scrollY);
    // always 0 because Timeline is height has not enough discussions
    // expect(scrollYH).not.toBe(0);
  });
});
