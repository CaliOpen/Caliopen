const { signin, showSettings } = require('../utils/user-util');
const { switchApp, home } = require('../utils/navigation');
const { filter } = require('../utils/timeline');

describe('Tag', () => {
  const EC = protractor.ExpectedConditions;

  beforeAll(async () => {
    await signin();
  });

  beforeEach(async () => {
    await home();
  });

  it('Manage tags on a message of a discussion', async () => {
    // make sure the discussion is only one message because of scroll and saucelabs that will try to click on header instead of Tag
    const content = 'Shut up and take my money! Leela, are you alright?';
    await browser.wait(EC.presenceOf($('.s-timeline .s-message-item')), 5 * 1000);
    await element(by.cssContainingText('.s-timeline .s-message-item .s-message-item__title .s-message-item__excerpt', content)).click();
    await browser.wait(EC.presenceOf(element(by.cssContainingText('.m-message__container', content))), 5 * 1000);
    console.log('click tag');
    await browser.executeScript('window.scrollTo(0, 350);');
    await element(by.cssContainingText('.m-message__container', content)).element(by.cssContainingText('.m-message-actions-container__action', 'Tags')).click();
    expect(element(by.cssContainingText('.m-modal', 'Tags')).isPresent()).toEqual(true);
    await element(by.css('.m-modal__close')).click();
  });

  it('Manage tags on timeline', async () => {
    const tagName = 'Mon tag';

    await filter('All');
    await browser.wait(EC.presenceOf($('.s-timeline .s-message-item')), 5 * 1000);
    // XXX: force scroll due to call-to-action
    await browser.executeScript('window.scrollTo(0, document.body.scrollHeight);');

    const messageElement = element(by.cssContainingText('.s-message-item', 'Fry! Stay back! He\'s too powerful!'));
    await messageElement.element(by.css('.s-message-item__col-select input[type=checkbox]')).click();

    await element(by.css('.m-message-selector__actions .m-button[aria-label="Manage tags"]')).click();
    expect(element(by.cssContainingText('.m-modal', 'Tags')).isPresent()).toEqual(true);
    expect(element.all(by.css('.m-tags-form__section .m-tag-item')).count()).toEqual(2);
    await browser.element(by.css('.m-tags-form .m-input-text')).sendKeys('am');
    await browser.element(by.cssContainingText('.m-tags-form__found-tag', 'Amphibians')).click();
    await browser.wait(EC.presenceOf(element(by.cssContainingText('.m-tags-form__section .m-tag-item', 'Amphibians'))), 5 * 1000);

    await browser.element(by.css('.m-tags-form .m-input-text')).sendKeys(tagName);
    await browser.element(by.css('.m-tags-search__button[aria-label=Add]')).click();
    await browser.wait(EC.presenceOf(element(by.cssContainingText('.m-tags-form__section .m-tag-item', tagName))), 8 * 1000);

    await element(by.cssContainingText('.m-tags-form__section .m-tag-item', 'Inbox')).element(by.css('[aria-label="Remove"]')).click();
    await browser.wait(EC.stalenessOf(element(by.cssContainingText('.m-tags-form__section .m-tag-item', 'Inbox'))), 5 * 1000);

    await element(by.cssContainingText('.m-tags-form__section .m-tag-item', tagName)).element(by.css('[aria-label="Remove"]')).click();
    await browser.wait(EC.stalenessOf(element(by.cssContainingText('.m-tags-form__section .m-tag-item', tagName))), 5 * 1000);
    await browser.wait(EC.stalenessOf(messageElement.element(by.cssContainingText('.s-message-item__tags', tagName))), 5 * 1000);
    await element(by.css('.m-modal__close')).click();
  });

  it('Manage tags for multiple messages on timeline', async () => {
    const tagName = 'Mon tag';
    await filter('All');
    await browser.wait(EC.presenceOf($('.s-timeline .s-message-item')), 5 * 1000);
    await browser.executeScript('window.scrollTo(0, document.body.scrollHeight);');

    const messageElement1 = element(by.cssContainingText('.s-message-item', 'zoidberg'));
    const messageElement2 = element(by.cssContainingText('.s-message-item', 'Fry! Stay back!'));

    await messageElement1.element(by.css('.s-message-item__col-select input[type=checkbox]')).click();
    await messageElement2.element(by.css('.s-message-item__col-select input[type=checkbox]')).click();
    await element(by.css('.m-message-selector__actions .m-button[aria-label="Manage tags"]')).click();
    expect(element(by.cssContainingText('.m-modal', 'Tags')).isPresent()).toEqual(true);
    expect(element.all(by.css('.m-tags-form__section .m-tag-item')).count()).toEqual(1);
    await browser.element(by.css('.m-tags-form .m-input-text')).sendKeys('in');
    await browser.element(by.cssContainingText('.m-tags-form__found-tag', 'Inbox')).click();
    await browser.wait(EC.presenceOf(element(by.cssContainingText('.m-tags-form__section .m-tag-item', 'Inbox'))), 5 * 1000);
    await browser.element(by.css('.m-tags-form .m-input-text')).sendKeys(tagName);
    await browser.element(by.css('.m-tags-search__button[aria-label=Add]')).click();
    await browser.wait(EC.presenceOf(element(by.cssContainingText('.m-tags-form__section .m-tag-item', tagName))), 5 * 1000);
    await element(by.cssContainingText('.m-tags-form__section .m-tag-item', 'Inbox')).element(by.css('[aria-label="Remove"]')).click();
    expect(element(by.cssContainingText('.m-tags-form__section .m-tag-item', 'Inbox')).isPresent()).toEqual(false);
    await browser.sleep(1);
    await element(by.cssContainingText('.m-tags-form__section .m-tag-item', tagName)).element(by.css('[aria-label="Remove"]')).click();
    await browser.sleep(1);
    expect(element(by.cssContainingText('.m-tags-form__section .m-tag-item', tagName)).isPresent()).toEqual(false);
    await element(by.css('.m-modal__close')).click();
  });

  it('Manage tags on a contact', async () => {
    await switchApp('Contacts');
    await browser.wait(EC.presenceOf($('.m-contact-list__contact')), 5 * 1000);
    await element(by.cssContainingText('.m-contact-list__contact', 'Bender Bending Rodriguez')).click();
    await browser.wait(EC.presenceOf(element(by.cssContainingText('.m-contact-profile__name', 'Bender Bending Rodriguez'))), 5 * 1000);
    await element(by.css('.s-contact__actions-switcher')).click();
    await element(by.cssContainingText('.s-contact__action', 'Edit tags')).click();
    expect(element(by.cssContainingText('.m-modal', 'Tags')).isPresent()).toEqual(true);
    await element(by.css('.m-modal__close')).click();
  });

  describe('Manage tags in settings', () => {
    it('Add and remove a new tag', async () => {
      const tagName = 'Mon nouveau tag';
      await showSettings('Tags');
      await browser.wait(EC.presenceOf($('.m-add-tag .m-input-text')), 5 * 1000);
      await element(by.css('.m-add-tag .m-input-text')).sendKeys(tagName);
      await element(by.css('.m-add-tag__button[aria-label=Add]')).click();
      await browser.wait(EC.presenceOf(element(by.cssContainingText('.s-tags-settings__tags .m-tag-input', tagName))), 5 * 1000);
      await element(by.cssContainingText('.s-tags-settings__tags .m-tag-input', tagName)).element(by.css('.m-tag-input__delete')).click();
      await browser.sleep(1);
      expect(element(by.cssContainingText('.s-tags-settings__tags .m-tag-input', tagName)).isPresent()).toEqual(false);
    });

    it('Should not allow to create a tag that already exist', async () => {
      const tagName = 'my_tag';
      await showSettings('Tags');
      await browser.wait(EC.presenceOf($('.m-add-tag .m-input-text')), 5 * 1000);
      await element(by.css('.m-add-tag .m-input-text')).sendKeys(tagName);
      await element(by.css('.m-add-tag__button[aria-label=Add]')).click();
      await browser.wait(EC.presenceOf(element(by.cssContainingText('.s-tags-settings__tags .m-tag-input', tagName))), 5 * 1000);
      await element(by.css('.m-add-tag .m-input-text')).sendKeys(tagName);
      await element(by.css('.m-add-tag__button[aria-label=Add]')).click();
      await browser.wait(EC.presenceOf(element(by.cssContainingText('.m-field-errors', 'Unable to create the tag. A tag with the same id may already exist.'))), 5 * 1000);
      // FIXME: do not click on floating action button instead of delete
      await browser.executeScript('window.scrollTo(0, document.body.scrollHeight);');
      // ---
      await element(by.cssContainingText('.s-tags-settings__tags .m-tag-input', tagName)).element(by.css('.m-tag-input__delete')).click();
      await browser.sleep(1);
      expect(element(by.cssContainingText('.s-tags-settings__tags .m-tag-input', tagName)).isPresent()).toEqual(false);
    });

    it('Rename a tag', async () => {
      const tagName = ' Edited';
      await showSettings('Tags');
      await browser.wait(EC.presenceOf(element(by.css('.m-add-tag .m-input-text'))), 5 * 1000);
      await element(by.cssContainingText('.s-tags-settings__tags .m-tag-input .m-tag-input__button', 'Inbox')).click();
      // key chord works on FF not chrome
      await element(by.css('.m-tag-input__input .m-input-text')).sendKeys(protractor.Key.chord(protractor.Key.CONTROL, 'a'), tagName);
      await element(by.css('.m-tag-input .m-button[aria-label=Save]')).click();
      await browser.wait(EC.presenceOf(element(by.cssContainingText('.s-tags-settings__tags .m-tag-input .m-tag-input__button', tagName)), 5 * 1000));
    });
  });
});
