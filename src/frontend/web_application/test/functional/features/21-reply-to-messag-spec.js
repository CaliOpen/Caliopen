const userUtil = require('../utils/user-util');
const { home } = require('../utils/navigation');
const { filter } = require('../utils/timeline');

describe('Reply to message -', () => {
  const EC = protractor.ExpectedConditions;

  const waitAndRefresh = async (waitForElementSelector) => {
    await browser.sleep(6 * 1000);
    await browser.refresh();
    await browser.wait(EC.presenceOf(waitForElementSelector), 5 * 1000);
    console.log('page refreshed');
  };

  beforeAll(() => {
    userUtil.signin();
  });

  beforeEach(() => {
    home();
  });

  it('Automatically saves a draft', async () => {
    const discussion1Selector = by.cssContainingText(
      '.s-timeline .s-message-item .s-message-item__title .s-message-item__excerpt',
      'Fry! Stay back! He\'s too powerful!'
    );
    const text1 = 'Automatically saves a draft, then refresh.';
    const text2 = ' Automatically updates a draft, then refresh.';

    await filter('All');
    await browser.wait(EC.presenceOf($('.s-timeline .s-message-item')), 5 * 1000);
    await element(discussion1Selector).click();
    await browser.wait(EC.presenceOf($('.m-discussion-textarea__body')), 5 * 1000);
    console.log('write msg');
    await element(by.css('.m-discussion-textarea__body')).sendKeys(text1);
    console.log('wait 5sec, refresh & see msg');
    await waitAndRefresh(element(by.css('.m-discussion-textarea__body')));

    const draftBodyElement1 = element(by.css('.m-discussion-textarea__body'));
    expect(draftBodyElement1.getText()).toEqual(text1);
    console.log('write again and refresh');
    draftBodyElement1.sendKeys(text2);

    await waitAndRefresh(element(by.css('.m-discussion-textarea__body')));
    expect(element(by.css('.m-discussion-textarea__body')).getText()).toContain(`${text1}${text2}`);

    await element(by.cssContainingText('button', 'Send')).click();
    await browser.wait(EC.presenceOf(element(by.css('.m-message-list__list'))), 1 * 1000);
  });

  it('Automatically saves a draft while browsing', async () => {
    const discussion1Selector = by.cssContainingText(
      '.s-timeline .s-message-item .s-message-item__title .s-message-item__excerpt',
      'Fry! Stay back! He\'s too powerful!'
    );
    const discussion2Selector = by.cssContainingText(
      '.s-timeline .s-message-item .s-message-item__title .s-message-item__subject',
      'Shut up and take my money'
    );
    const text3 = 'Add an answer to second discussion, don\'t wait and go to first one.';
    await browser.wait(EC.presenceOf($('.s-timeline .s-message-item')), 5 * 1000);
    await element(discussion2Selector).click();
    await browser.wait(EC.presenceOf($('.m-discussion-textarea__body')), 5 * 1000);
    await element(by.css('.m-discussion-textarea__body')).sendKeys(text3);

    console.log('back to first discussion, don\'t wait');
    await home();
    await filter('All');
    // force scroll top to click on discussion
    await browser.executeScript('window.scrollTo(0,0);');
    await element(discussion1Selector).click();
    await browser.wait(EC.presenceOf($('.m-message-list__list')), 5 * 1000);
    console.log('go to 2nd discussion, wait then refresh');

    await home();
    await element(discussion2Selector).click();
    await browser.wait(EC.presenceOf(element(by.css('.m-message-list__list'))), 5 * 1000);
    await waitAndRefresh(element(by.css('.m-discussion-textarea__body')));
    const draftBodyElement2 = element(by.css('.m-discussion-textarea__body'));
    expect(draftBodyElement2.getText()).toEqual(text3);
    console.log('send');
    await element(by.cssContainingText('button', 'Send')).click();
    await browser.wait(EC.presenceOf(element(by.css('.m-message-list__list'))), 5 * 1000);
  });

  it('Force saves a draft', async () => {
    const discussion1Selector = by.cssContainingText(
      '.s-timeline .s-message-item .s-message-item__title .s-message-item__excerpt',
      'Fry! Stay back! He\'s too powerful!'
    );
    const text1 = 'Force save a draft.';
    await filter('All');
    await browser.wait(EC.presenceOf($('.s-timeline .s-message-item')), 5 * 1000);
    await element(discussion1Selector).click();
    await browser.wait(EC.presenceOf($('.m-discussion-textarea__body')), 5 * 1000);
    console.info('write msg');
    await element(by.css('.m-discussion-textarea__body')).sendKeys(protractor.Key.chord(protractor.Key.CONTROL, 'a'), text1);

    await element(by.cssContainingText('button', 'Save')).click();
    await browser.sleep(1 * 1000);
    await browser.refresh();
    await browser.wait(EC.presenceOf(element(by.css('.m-discussion-textarea__body'))), 5 * 1000);
    const draftBodyElement1 = element(by.css('.m-discussion-textarea__body'));
    expect(draftBodyElement1.getText()).toContain(text1);
    await element(by.cssContainingText('button', 'Send')).click();
    await browser.wait(EC.presenceOf(element(by.css('.m-message-list__list'))), 5 * 1000);
  });

  it('Sends a draft', async () => {
    const discussion1Selector = by.cssContainingText(
      '.s-timeline .s-message-item .s-message-item__title .s-message-item__excerpt',
      'Fry! Stay back! He\'s too powerful!'
    );
    const text1 = 'yes I am!';

    await filter('All');
    await browser.wait(EC.presenceOf(element(by.css('.s-timeline .s-message-item'))), 5 * 1000);
    await element(discussion1Selector).click();
    await browser.wait(EC.presenceOf(element(by.css('.m-discussion-textarea__body'))), 5 * 1000);
    console.info('write msg');
    const draftBodyElement1 = element(by.css('.m-discussion-textarea__body'));
    draftBodyElement1.sendKeys(protractor.Key.chord(protractor.Key.CONTROL, 'a'), text1);

    await element(by.cssContainingText('button', 'Send')).click();
    await browser.sleep(1 * 1000);
    await browser.wait(EC.presenceOf(element(by.css('.m-discussion-textarea__body'))), 5 * 1000);
    const draftBodyElement2 = element(by.css('.m-discussion-textarea__body'));
    expect(draftBodyElement2.getText()).toEqual('');
    expect(element(by.cssContainingText('.m-message__body', text1)).isPresent()).toEqual(true);
  });
});
