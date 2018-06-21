const userUtil = require('../utils/user-util');
const { home } = require('../utils/navigation');
const { filter } = require('../utils/timeline');

describe('Discussions', () => {
  const EC = protractor.ExpectedConditions;

  beforeAll(async () => {
    await userUtil.signin();
  });

  beforeEach(async () => {
    await home();
  });

  it('List', async () => {
    expect(element(by.css('.m-application-switcher .m-navbar-item__content')).getText()).toContain('MESSAGES');
    await browser.wait(EC.presenceOf($('.s-timeline .s-message-item')), 5 * 1000);
    expect(element.all(by.css('.s-timeline .s-message-item .s-message-item__title .s-message-item__excerpt')).first().getText())
      .toContain('It\'s okay, Bender. I like cooking too.');
    expect(element.all(by.css('.s-message-item')).count()).toEqual(4);
    expect(element(by.cssContainingText('.s-timeline__load-more', 'Load more')).isPresent())
      .toBe(false);
  });

  describe('Thread', () => {
    it('Render and listed contacts describe the thread', async () => {
      await filter('All');
      await browser.wait(EC.presenceOf($('.s-timeline .s-message-item')), 5 * 1000);
      element(by.cssContainingText(
        '.s-message-item .s-message-item__title',
        'Fry! Stay back! He\'s too powerful!'
      )).click();

      expect(element(by.cssContainingText('.m-navbar-item--is-active .m-navbar-item__content', 'Jaune john')).isPresent())
        .toEqual(true);
    });
  });
});
