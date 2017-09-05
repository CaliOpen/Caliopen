const userUtil = require('../utils/user-util');
const { switch: switchApp } = require('../utils/switch-application.js');

describe('Save a draft and send', () => {
  const EC = protractor.ExpectedConditions;
  const locale = 'en';
  const __ = key => ({
    fr: {
      send: 'Envoyer',
      save: 'Sauvegarder',
    },
    en: {
      send: 'Send',
      save: 'Save',
    },
  }[locale][key]);

  const waitAndRefresh = waitForElementSelector => browser.sleep(6 * 1000)
      .then(() => browser.refresh())
      .then(() => browser.wait(EC.presenceOf($(waitForElementSelector)), 5 * 1000))
      .then(() => console.log('page refreshed'));

  beforeEach(() => {
    userUtil.signin();
  });

  it('Automatically saves a draft', () => {
    const discussion1Selector = by.cssContainingText(
      '.s-discussion-list__thread',
      'test@caliopen.local, john@caliopen.local, zoidberg@planet-express.tld'
    );
    const text1 = 'Automatically saves a draft, then refresh.';
    const text2 = ' Automatically updates a draft, then refresh.';

    browser.get('/')
      .then(() => browser.wait(EC.presenceOf($('.s-discussion-list__thread')), 5 * 1000))
      .then(() => element(discussion1Selector).click())
      .then(() => browser.wait(EC.presenceOf($('.m-message-list')), 5 * 1000))
      .then(() => {
        console.log('write msg');
        const draftBodyElement1 = element(by.css('.m-discussion-textarea__body'));
        draftBodyElement1.sendKeys(text1);
        console.log('wait 5sec, refresh & see msg');

        return waitAndRefresh('.m-discussion-textarea__body');
      })
      .then(() => {
        const draftBodyElement1 = element(by.css('.m-discussion-textarea__body'));
        expect(draftBodyElement1.getText()).toEqual(text1);

        return draftBodyElement1;
      })
      .then((draftBodyElement1) => {
        console.log('write again and refresh');
        draftBodyElement1.sendKeys(text2);

        return waitAndRefresh('.m-discussion-textarea__body');
      })
      .then(() => {
        const draftBodyElement1 = element(by.css('.m-discussion-textarea__body'));
        expect(draftBodyElement1.getText()).toEqual(`${text1}${text2}`);
      })
      .then(() => element(by.cssContainingText('button', __('send'))).click())
      .then(() => browser.wait(EC.presenceOf($('.m-message-list')), 1 * 1000))
      ;
  });

  it('Automatically saves a draft while browsing', () => {
    const discussion1Selector = by.cssContainingText(
      '.s-discussion-list__thread',
      'test@caliopen.local, john@caliopen.local, zoidberg@planet-express.tld'
    );
    const discussion2Selector = by.cssContainingText(
      '.s-discussion-list__thread',
      'john@caliopen.local, fry@planet-express.tld'
    );
    const text3 = 'Add an answer to second discussion, don\'t wait and go to first one.';
    browser.get('/')
      .then(() => browser.wait(EC.presenceOf($('.s-discussion-list__thread')), 5 * 1000))
      .then(() => element(discussion2Selector).click())
      .then(() => browser.wait(EC.presenceOf($('.m-message-list')), 5 * 1000))
      .then(() => {
        const draftBodyElement2 = element(by.css('.m-discussion-textarea__body'));

        return draftBodyElement2.sendKeys(text3);
      })
      .then(() => {
        console.log('back to first discussion, don\'t wait');

        return switchApp('discussions');
      })
      .then(() => element(discussion1Selector).click())
      .then(() => browser.wait(EC.presenceOf($('.m-message-list')), 5 * 1000))
      .then(() => {
        console.log('go to 2nd discussion, wait then refresh');

        return switchApp('discussions');
      })
      .then(() => element(discussion2Selector).click())
      .then(() => browser.wait(EC.presenceOf($('.m-message-list')), 5 * 1000))
      .then(() => waitAndRefresh('.m-discussion-textarea__body'))
      .then(() => {
        const draftBodyElement2 = element(by.css('.m-discussion-textarea__body'));
        expect(draftBodyElement2.getText()).toEqual(text3);
      })
      .then(() => console.log('send'))
      .then(() => element(by.cssContainingText('button', __('send'))).click())
      .then(() => browser.wait(EC.presenceOf($('.m-message-list')), 5 * 1000))
    ;
  });

  it('force saves a draft', () => {
    const discussion1Selector = by.cssContainingText(
      '.s-discussion-list__thread',
      'test@caliopen.local, john@caliopen.local, zoidberg@planet-express.tld'
    );
    const text1 = 'Force save a draft.';
    browser.get('/')
      .then(() => browser.wait(EC.presenceOf($('.s-discussion-list__thread')), 5 * 1000))
      .then(() => element(discussion1Selector).click())
      .then(() => browser.wait(EC.presenceOf($('.m-message-list')), 5 * 1000))
      .then(() => {
        console.info('write msg');
        const draftBodyElement1 = element(by.css('.m-discussion-textarea textarea'));
        draftBodyElement1.sendKeys(protractor.Key.chord(protractor.Key.CONTROL, 'a'), text1);

        return element(by.cssContainingText('button', __('save'))).click();
      })
      .then(() => browser.sleep(1 * 1000))
      .then(() => browser.refresh())
      .then(() => browser.wait(EC.presenceOf($('.m-discussion-textarea__body')), 5 * 1000))
      .then(() => {
        const draftBodyElement1 = element(by.css('.m-discussion-textarea__body'));
        expect(draftBodyElement1.getText()).toEqual(text1);
      })
      .then(() => element(by.cssContainingText('button', __('send'))).click())
      .then(() => browser.wait(EC.presenceOf($('.m-message-list')), 5 * 1000))
    ;
  });

  it('sends a draft', () => {
    const discussion1Selector = by.cssContainingText(
      '.s-discussion-list__thread',
      'test@caliopen.local, john@caliopen.local, zoidberg@planet-express.tld'
    );
    const text1 = 'yes I am!';
    browser.get('/')
      .then(() => browser.wait(EC.presenceOf($('.s-discussion-list__thread')), 5 * 1000))
      .then(() => element(discussion1Selector).click())
      .then(() => browser.wait(EC.presenceOf($('.m-message-list')), 5 * 1000))
      .then(() => {
        console.info('write msg');
        const draftBodyElement1 = element(by.css('.m-discussion-textarea textarea'));
        draftBodyElement1.sendKeys(protractor.Key.chord(protractor.Key.CONTROL, 'a'), text1);

        return element(by.cssContainingText('button', __('send'))).click();
      })
      .then(() => browser.sleep(1 * 1000))
      .then(() => browser.wait(EC.presenceOf($('.m-discussion-textarea__body')), 5 * 1000))
      .then(() => {
        const draftBodyElement1 = element(by.css('.m-discussion-textarea__body'));
        expect(draftBodyElement1.getText()).toEqual('');
        expect(element(by.cssContainingText('.m-message__body__content', text1)).isPresent()).toEqual(true);
      })
      ;
  });
});
