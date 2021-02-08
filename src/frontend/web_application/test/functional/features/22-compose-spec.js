const userUtil = require('../utils/user-util');
const { home } = require('../utils/navigation');
// const { filter } = require('../utils/timeline');

describe('Compose new message', () => {
  const EC = protractor.ExpectedConditions;

  beforeAll(async () => {
    await userUtil.signin();
  });

  beforeEach(async () => {
    await home();
  });

  describe('Navigation between drafts', () => {
    it('Creates a new draft', async () => {
      const text1 = 'Compose creates a new draft';
      const writeButtonSelector = by.cssContainingText(
        '.m-action-btns__btn',
        'Compose'
      );

      await element(writeButtonSelector).click();
      await browser.wait(EC.presenceOf($('.s-new-draft')), 1000);
      const items = await element
        .all(by.css('.m-navbar-item .m-item-link'))
        .filter((item) => item.getText().then((text) => text === 'Compose'));
      expect(items.length).toEqual(1);
      console.log('write msg');
      const draftBodyElement1 = element(
        by.css('.m-draft-advanced__body .m-textarea')
      );
      await draftBodyElement1.sendKeys(text1);
      await element(writeButtonSelector).click();
      await browser.wait(EC.presenceOf($('.s-new-draft')), 1000);
      await expect(draftBodyElement1.getText()).not.toEqual(text1);
      const items2 = await element
        .all(by.css('.m-navbar-item .m-item-link'))
        .filter((item) => item.getText().then((text) => text === 'Compose'));
      expect(items2.length).toEqual(2);
      await items2[0].click();
      await browser.wait(EC.presenceOf($('.s-new-draft')), 1000);
      expect(draftBodyElement1.getText()).toEqual(text1);
    });
  });

  describe('Save a draft and send', () => {
    it('Composes a new message with no recipients', async () => {
      const text1 = 'new message with no rcpts ';

      const writeButtonSelector = by.cssContainingText(
        '.m-action-btns__btn',
        'Compose'
      );

      await element(writeButtonSelector).click();
      await browser.wait(EC.presenceOf($('.s-new-draft')), 1000);
      expect(
        element(by.cssContainingText('.m-navbar-item', 'Compose')).isPresent()
      ).toEqual(true);
      console.log('write msg');
      const draftBodyElement1 = element(
        by.css('.m-draft-advanced__body .m-textarea')
      );
      await draftBodyElement1.sendKeys(text1);
      // await element(by.cssContainingText('button', 'Save')).click();
      // XXX: save button will be back soon; wait for autosave
      await browser.sleep(6 * 1000);
      await browser.wait(EC.presenceOf(draftBodyElement1), 3 * 1000);
      expect(
        element.all(by.css('.m-recipient-list__recipient')).count()
      ).toEqual(0);
      expect(draftBodyElement1.getText()).toEqual(text1);
      await home();
      // await filter('All');
      await browser.wait(
        EC.presenceOf($('.s-timeline .s-discussion-item')),
        3 * 1000
      );
      expect(
        element
          .all(
            by.cssContainingText('.s-discussion-item__message_excerpt', text1)
          )
          .count()
      ).toEqual(1);
    });

    it('Composes a new message with a known recipient', async () => {
      const text1 = 'new message for a known recipient';
      const writeButtonSelector = by.cssContainingText(
        '.m-action-btns__btn',
        'Compose'
      );

      await element(writeButtonSelector).click();
      await browser.wait(EC.presenceOf($('.s-new-draft')), 1000);
      console.info('search recipient');
      const searchInputElement = element(
        by.css('.m-recipient-list__search-input')
      );
      await searchInputElement.sendKeys('ben');
      await browser.wait(
        EC.presenceOf($('.m-recipient-list__search-result')),
        3 * 1000
      );
      const results = await element.all(
        by.css('.m-recipient-list__search-result')
      );
      await results[0].click();
      console.info('write msg');
      const draftBodyElement1 = element(
        by.css('.m-draft-advanced__body .m-textarea')
      );
      await draftBodyElement1.sendKeys(text1);
      // await element(by.cssContainingText('button', 'Save')).click();
      await browser.wait(EC.presenceOf(draftBodyElement1), 3 * 1000);
      const items = await element.all(by.css('.m-recipient-list__recipient'));
      expect(items.length).toEqual(1);
      expect(items[0].getText()).toContain('bender@caliopen.local');
    });
  });

  describe('Recipient search results manipulation', () => {
    it('Has no suggestions for an already selected recipient', async () => {
      const writeButtonSelector = by.cssContainingText(
        '.m-action-btns__btn',
        'Compose'
      );

      await element(writeButtonSelector).click();
      await browser.wait(EC.presenceOf($('.s-new-draft')), 1000);
      console.info('search recipient');
      const searchInputElement = element(
        by.css('.m-recipient-list__search-input')
      );

      await searchInputElement.sendKeys('caliopen');
      await browser.wait(
        EC.presenceOf($('.m-recipient-list__search-result')),
        3 * 1000
      );
      await element(
        by.cssContainingText(
          '.m-recipient-list__search-result',
          'bender@caliopen.local'
        )
      ).click();
      const searchInputElement2 = element(
        by.css('.m-recipient-list__search-input')
      );

      await searchInputElement2.sendKeys('caliopen');
      await browser.wait(
        EC.presenceOf($('.m-recipient-list__search-result')),
        3 * 1000
      );
      expect(
        element(
          by.cssContainingText(
            '.m-recipient-list__search-result',
            'bender@caliopen.local'
          )
        ).isPresent()
      ).toEqual(false);
      const items = await element.all(by.css('.m-recipient-list__recipient'));
      expect(items.length).toEqual(1);
      expect(items[0].getText()).toContain('bender@caliopen.local');
    });

    it('Adds a recipient when clicking outside', async () => {
      const writeButtonSelector = by.cssContainingText(
        '.m-action-btns__btn',
        'Compose'
      );
      const dropdownSelector = by.css('.m-recipient-list__search .m-dropdown');
      const searchTerm = 'ben';

      await element(writeButtonSelector).click();
      await browser.wait(EC.presenceOf($('.s-new-draft')), 1000);
      console.log('search recipient');
      const searchInputElement = element(
        by.css('.m-recipient-list__search-input')
      );
      await searchInputElement.sendKeys(searchTerm);
      await browser.wait(
        EC.presenceOf($('.m-recipient-list__search-result')),
        3 * 1000
      );
      const t1 = await element(dropdownSelector).isDisplayed();
      expect(t1).toEqual(true);
      await element(by.css('.m-recipient-list__search-input')).click();
      const t2 = await element(dropdownSelector).isDisplayed();
      expect(t2).toEqual(true);
      await element(by.cssContainingText('.s-new-draft', 'From')).click();
      const t3 = await element(dropdownSelector).isDisplayed();
      expect(t3).toEqual(false);
      await browser.sleep(1 * 1000);
      expect(
        element(
          by.cssContainingText('.m-recipient-list__recipient', searchTerm)
        ).isPresent()
      ).toEqual(true);
    });

    it('Can use keyboard arrows to select search result', async () => {
      const writeButtonSelector = by.cssContainingText(
        '.m-action-btns__btn',
        'Compose'
      );
      const searchResultItemsSelector = by.css(
        '.m-recipient-list__search-result'
      );

      await element(writeButtonSelector).click();
      await browser.wait(EC.presenceOf($('.s-new-draft')), 1000);
      console.log('search recipient');
      const searchInputElement = element(
        by.css('.m-recipient-list__search-input')
      );
      await searchInputElement.sendKeys('caliopen');
      await browser.wait(
        EC.presenceOf($('.m-recipient-list__search-result')),
        3 * 1000
      );

      const items = await element.all(searchResultItemsSelector);
      expect(items[0].getAttribute('class')).toContain('m-button--active');
      await searchInputElement.sendKeys(protractor.Key.ARROW_DOWN);
      const items2 = await element.all(searchResultItemsSelector);
      expect(items2[0].getAttribute('class')).not.toContain('m-button--active');
      expect(items2[1].getAttribute('class')).toContain('m-button--active');
      await searchInputElement.sendKeys(protractor.Key.ARROW_DOWN);
      const items3 = await element.all(searchResultItemsSelector);
      expect(items3[2].getAttribute('class')).toContain('m-button--active');
      await searchInputElement.sendKeys(
        protractor.Key.ARROW_UP,
        protractor.Key.ENTER
      );
      const items4 = await element.all(by.css('.m-recipient-list__recipient'));
      expect(items4.length).toEqual(1);
      expect(items4[0].getText()).toContain('zoidberg@planet-express.tld');
    });
  });
});
