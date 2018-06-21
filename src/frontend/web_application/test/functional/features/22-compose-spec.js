const userUtil = require('../utils/user-util');
const { home } = require('../utils/navigation');
const { filter } = require('../utils/timeline');

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
      const writeButtonSelector = by.cssContainingText('.m-call-to-action__btn', 'Compose');

      // XXX: click .btn--principal to force :hover callback actions
      await element(by.css('.m-call-to-action__btn--principal')).click();
      await element(writeButtonSelector).click();
      await browser.wait(EC.presenceOf($('.m-new-draft')), 1000);
      const items = await element.all(by.css('.m-navbar-item .m-item-link'))
        .filter(item => item.getText().then(text => text === 'COMPOSE'));
      expect(items.length).toEqual(1);
      console.log('write msg');
      const draftBodyElement1 = element(by.css('.m-discussion-textarea__body'));
      await draftBodyElement1.sendKeys(text1);
      await element(writeButtonSelector).click();
      await browser.wait(EC.presenceOf($('.m-new-draft')), 1000);
      await expect(element(by.css('.m-discussion-textarea__body')).getText()).not.toEqual(text1);
      const items2 = await element.all(by.css('.m-navbar-item .m-item-link'))
        .filter(item => item.getText().then(text => text === 'COMPOSE'));
      expect(items2.length).toEqual(2);
      await items2[0].click();
      await browser.wait(EC.presenceOf($('.m-new-draft')), 1000);
      expect(element(by.css('.m-discussion-textarea__body')).getText()).toEqual(text1);
    });
  });

  describe('Save a draft and send', () => {
    it('Composes a new message with no recipients', async () => {
      const text1 = 'new message with no rcpts ';

      const writeButtonSelector = by.cssContainingText('.m-call-to-action__btn', 'Compose');

      // XXX: click .btn--principal to force :hover callback actions
      await element(by.css('.m-call-to-action__btn--principal')).click();
      await element(writeButtonSelector).click();
      await browser.wait(EC.presenceOf($('.m-new-draft')), 1000);
      expect(element(by.cssContainingText('.m-navbar-item', 'Compose')).isPresent()).toEqual(true);
      console.log('write msg');
      const draftBodyElement1 = element(by.css('.m-discussion-textarea__body'));
      draftBodyElement1.sendKeys(text1);
      await element(by.cssContainingText('button', 'Save')).click();
      await browser.wait(EC.presenceOf($('.m-discussion-textarea__body')), 3 * 1000);
      expect(element.all(by.css('.m-discussion-textarea__body .m-recipient-list__recipient')).count())
        .toEqual(0);
      const draftBodyElement2 = element(by.css('.m-discussion-textarea__body'));
      expect(draftBodyElement2.getText()).toEqual(text1);
      await element(by.cssContainingText('.m-navbar-item__content', 'Messages')).click();
      await filter('All');
      await browser.wait(EC.presenceOf($('.s-timeline .s-message-item')), 3 * 1000);
      expect(element.all(by.cssContainingText('.s-message-item__excerpt', text1)).count())
        .toEqual(1);
    });

    it('Composes a new message with a known recipient', async () => {
      const text1 = 'new message for a known recipient';
      const writeButtonSelector = by.cssContainingText('.m-call-to-action__btn', 'Compose');

      // XXX: click .btn--principal to force :hover callback actions
      await element(by.css('.m-call-to-action__btn--principal')).click();
      await element(writeButtonSelector).click();
      await browser.wait(EC.presenceOf($('.m-new-draft')), 1000);
      console.info('search recipient');
      const searchInputElement = element(by.css('.m-recipient-list__search-input'));
      await searchInputElement.sendKeys('ben');
      await browser.wait(EC.presenceOf($('.m-recipient-list__search-result')), 3 * 1000);
      const results = await element.all(by.css('.m-recipient-list__search-result'));
      await results[0].click();
      console.info('write msg');
      const draftBodyElement1 = element(by.css('.m-discussion-textarea__body'));
      await draftBodyElement1.sendKeys(text1);
      await element(by.cssContainingText('button', 'Save')).click();
      await browser.wait(EC.presenceOf($('.m-discussion-textarea__body')), 3 * 1000);
      const items = await element.all(by.css('.m-recipient-list__recipient'));
      expect(items.length).toEqual(1);
      expect(items[0].getText()).toContain('bender@caliopen.local');
    });
  });

  describe('Recipient search results manipulation', () => {
    it('Has no suggestions for an already selected recipient', async () => {
      const writeButtonSelector = by.cssContainingText('.m-call-to-action__btn', 'Compose');

      // XXX: click .btn--principal to force :hover callback actions
      await element(by.css('.m-call-to-action__btn--principal')).click();
      await element(writeButtonSelector).click();
      await browser.wait(EC.presenceOf($('.m-new-draft')), 1000);
      console.info('search recipient');
      const searchInputElement = element(by.css('.m-recipient-list__search-input'));

      await searchInputElement.sendKeys('caliopen');
      await browser.wait(EC.presenceOf($('.m-recipient-list__search-result')), 3 * 1000);
      await element(by.cssContainingText('.m-recipient-list__search-result', 'bender@caliopen.local')).click();
      const searchInputElement2 = element(by.css('.m-recipient-list__search-input'));

      await searchInputElement2.sendKeys('caliopen');
      await browser.wait(EC.presenceOf($('.m-recipient-list__search-result')), 3 * 1000);
      expect(element(by.cssContainingText('.m-recipient-list__search-result', 'bender@caliopen.local')).isPresent())
        .toEqual(false);
      const items = await element.all(by.css('.m-recipient-list__recipient'));
      expect(items.length).toEqual(1);
      expect(items[0].getText()).toContain('bender@caliopen.local');
    });

    it('Adds a recipient when clicking outside', async () => {
      const writeButtonSelector = by.cssContainingText('.m-call-to-action__btn', 'Compose');
      const dropdownSelector = by.css('.m-recipient-list__search .m-dropdown');
      const searchTerm = 'ben';

      // XXX: click .btn--principal to force :hover callback actions
      await element(by.css('.m-call-to-action__btn--principal')).click();
      await element(writeButtonSelector).click();
      await browser.wait(EC.presenceOf($('.m-new-draft')), 1000);
      console.log('search recipient');
      const searchInputElement = element(by.css('.m-recipient-list__search-input'));
      await searchInputElement.sendKeys(searchTerm);
      await browser.wait(EC.presenceOf($('.m-recipient-list__search-result')), 3 * 1000);
      expect(element(dropdownSelector).isDisplayed()).toEqual(true);
      await element(by.css('.m-recipient-list__search-input')).click();
      expect(element(dropdownSelector).isDisplayed()).toEqual(true);
      await element(by.cssContainingText('.l-navigation__tab-list .m-navbar-item__content', 'Compose')).click();
      expect(element(dropdownSelector).isDisplayed()).toEqual(false);
      expect(element(by.cssContainingText('.m-recipient-list__recipient', searchTerm)).isDisplayed()).toEqual(true);
    });

    it('Can use keyboard arrows to select search result', async () => {
      const writeButtonSelector = by.cssContainingText('.m-call-to-action__btn', 'Compose');
      const searchResultItemsSelector = by.css('.m-recipient-list__search-result');

      // XXX: click .btn--principal to force :hover callback actions
      await element(by.css('.m-call-to-action__btn--principal')).click();
      await element(writeButtonSelector).click();
      await browser.wait(EC.presenceOf($('.m-new-draft')), 1000);
      console.log('search recipient');
      const searchInputElement = element(by.css('.m-recipient-list__search-input'));
      await searchInputElement.sendKeys('caliopen');
      await browser.wait(EC.presenceOf($('.m-recipient-list__search-result')), 3 * 1000);

      const items = await element.all(searchResultItemsSelector);
      expect(items[0].getAttribute('class')).toContain('m-button--active');
      await searchInputElement.sendKeys(protractor.Key.ARROW_DOWN);
      const items2 = await element.all(searchResultItemsSelector);
      expect(items2[0].getAttribute('class')).not.toContain('m-button--active');
      expect(items2[1].getAttribute('class')).toContain('m-button--active');
      await searchInputElement.sendKeys(protractor.Key.ARROW_DOWN);
      const items3 = await element.all(searchResultItemsSelector);
      expect(items3[2].getAttribute('class')).toContain('m-button--active');
      await searchInputElement.sendKeys(protractor.Key.ARROW_UP, protractor.Key.ENTER);
      const items4 = await element.all(by.css('.m-recipient-list__recipient'));
      expect(items4.length).toEqual(1);
      expect(items4[0].getText()).toContain('zoidberg@caliopen.local');
    });
  });
});
