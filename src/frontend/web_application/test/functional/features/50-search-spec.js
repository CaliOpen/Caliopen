const userUtil = require('../utils/user-util');

describe('search', () => {
  const EC = protractor.ExpectedConditions;
  const locale = 'en';
  const __ = key => ({
    fr: {
      tab_label_foobar: 'Resultats pour : Foobar',
      msg_label_foobar: '2 messages contiennent "Foobar" dans leur subjet ou contenu',
      contact_label_foobar: '0 contacts contiennent "Foobar" dans leur libellé ou profile',
      msg_link: 'Message',
    },
    en: {
      tab_label_foobar: 'Results for: Foobar',
      msg_label_foobar: '2 messages contains "Foobar" in their subject or content',
      contact_label_foobar: '0 contacts contains "Foobar" in their label or profile',
      msg_link: 'Message',
    },
  }[locale][key]);

  beforeEach(() => {
    userUtil.signin();
  });

  it('search for Foobar', () => {
    const searchTerms = 'Foobar';

    browser.get('./')
      .then(() => element(by.css('.m-search-field__input')).sendKeys(searchTerms))
      .then(() => element(by.css('.m-search-field__button')).click())
      .then(() => browser.wait(EC.presenceOf(element(by.cssContainingText('.l-search-results__panel', __('msg_label_foobar')))), 5 * 1000))
      .then(() => expect(element(by.cssContainingText('.l-search-results__panel', __('contact_label_foobar'))).isPresent()).toEqual(true))
      .then(() => expect(element(by.cssContainingText('.m-navbar-item', __('tab_label_foobar'))).isPresent()).toEqual(true))
      .then(() => expect(element.all(by.css('.s-message-result-item')).count()).toEqual(2))
      .then(() => element(by.cssContainingText('.m-nav-list__item .m-link', __('msg_link'))).click())
      .then(() => browser.wait(EC.presenceOf($('.l-search-results')), 5 * 1000))
      .then(() => expect(element(by.cssContainingText('.l-search-results__panel', __('msg_label_foobar'))).isPresent()).toEqual(false))
      .then(() => expect(element.all(by.css('.s-message-result-item')).count()).toEqual(2))
      ;
  });
});
