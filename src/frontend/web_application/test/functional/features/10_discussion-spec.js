const userUtil = require('../utils/user-util');

describe('Discussions', () => {
  const EC = protractor.ExpectedConditions;

  beforeEach(() => {
    userUtil.signin();
  });

  it('list', () => {
    browser.get('/')
      .then(() => {
        const appSwitcher = element(by.css('.m-application-switcher'));
        expect(appSwitcher.element(by.cssContainingText('.m-navbar-item__content', 'Messages')).isPresent())
        .toBe(true);
      })
      .then(() => browser.wait(EC.presenceOf($('.s-timeline .s-message-item')), 5 * 1000))
      .then(() => {
        expect(element.all(by.css('.s-timeline .s-message-item')).first().getText())
          .toContain('Fry! Stay back! He\'s too powerful!');
        expect(element.all(by.css('.s-message-item')).count()).toEqual(7);
        expect(
          element(by.cssContainingText('.s-timeline__load-more', 'Load more')).isPresent()
        ).toBe(false);
      });
  });

  describe('thread', () => {
    it('render and listed contacts describe the thread', () => {
      browser.get('/');
      browser.wait(EC.presenceOf($('.s-timeline .s-message-item')), 5 * 1000);
      element(by.cssContainingText(
        '.s-message-item',
        'zoidberg (zoidberg@planet-express.tld)'
      )).click();
      // TODO tabs
      // expect(element(by.css('.m-tab.m-navbar__item--is-active .m-tab__link')).getText())
      //   .toContain('zoidberg, john');
    });
  });
});
