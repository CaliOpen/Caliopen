const userUtil = require('../utils/user-util');
const { home } = require('../utils/navigation');

describe('Search', () => {
  const EC = protractor.ExpectedConditions;

  beforeAll(async () => {
    await userUtil.signin();
  });

  beforeEach(async () => {
    await home();
  });

  it('Search for Foobar', async () => {
    const searchTerms = 'Foobar';
    const tabLabel = 'Results for: Foobar';
    const msgLabel = '2 messages contains "Foobar" in their subject or content';
    const contactLabel =
      '0 contacts contains "Foobar" in their label or profile';

    await browser.wait(
      EC.presenceOf($('.s-timeline .s-discussion-item')),
      5 * 1000
    );
    await element(by.css('.m-search-field__search-input')).sendKeys(
      searchTerms
    );
    await element(by.css('.m-search-field__search-button')).click();
    await browser.wait(
      EC.presenceOf(
        element(by.cssContainingText('.l-search-results__panel', msgLabel))
      ),
      5 * 1000
    );
    expect(
      element(
        by.cssContainingText('.l-search-results__panel', contactLabel)
      ).isPresent()
    ).toEqual(true);
    expect(
      element(by.cssContainingText('.m-navbar-item', tabLabel)).isPresent()
    ).toEqual(true);
    expect(element.all(by.css('.s-message-result-item')).count()).toEqual(2);
    await element(
      by.cssContainingText('.m-nav-list__item .m-link', 'Message')
    ).click();
    await browser.wait(EC.presenceOf($('.l-search-results')), 5 * 1000);
    expect(
      element(
        by.cssContainingText('.l-search-results__panel', msgLabel)
      ).isPresent()
    ).toEqual(false);
    expect(element.all(by.css('.s-message-result-item')).count()).toEqual(2);
  });
});
