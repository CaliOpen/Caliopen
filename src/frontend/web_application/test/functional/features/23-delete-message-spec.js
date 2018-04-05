const userUtil = require('../utils/user-util');
const { home } = require('../utils/navigation');

describe('Delete message', () => {
  const EC = protractor.ExpectedConditions;

  beforeEach(() => {
    userUtil.signin();
  });

  const clickBtnInModal = btnText => element(by.cssContainingText('.m-modal button', btnText)).click();

  it('delete message one by one', () => {
    const discussion1Selector = by.cssContainingText(
      '.s-timeline .s-message-item .s-message-item__topic .s-message-item__excerpt',
      'last message to remove individually'
    );
    const message1ToDel = 'first message to remove individually';
    const message2ToDel = 'last message to remove individually';
    const deleteAMessage = (messageText) => {
      const messageElem = element(by.cssContainingText('.m-message', messageText));

      return messageElem.element(by.cssContainingText('.m-message-actions-container__action button', 'Delete')).click()
        .then(() => clickBtnInModal('Yes I\'m sure'));
    };

    home()
      .then(() => browser.wait(EC.presenceOf($('.s-timeline .s-message-item')), 5 * 1000))
      .then(() => element(discussion1Selector).click())
      .then(() => browser.wait(EC.presenceOf($('.m-message')), 5 * 1000))
      .then(() => deleteAMessage(message1ToDel))
      .then(() => browser.wait(EC.presenceOf($('.m-message')), 5 * 1000))
      .then(() => expect(element(by.cssContainingText('.m-message', message1ToDel)).isPresent()).toBe(false))
      .then(() => deleteAMessage(message2ToDel))
      .then(() => browser.wait(EC.presenceOf($('.s-timeline')), 5 * 1000))
      ;
  });

  it('delete all messages of a collection', () => {
    const discussionSelector = by.cssContainingText(
      '.s-timeline .s-message-item .s-message-item__topic .s-message-item__excerpt',
      'a message of a collection to remove'
    );

    home()
      .then(() => browser.wait(EC.presenceOf($('.s-timeline .s-message-item')), 5 * 1000))
      .then(() => element(discussionSelector).click())
      .then(() => browser.wait(EC.presenceOf($('.m-message-list__action')), 5 * 1000))
      .then(() => browser.executeScript('window.scrollTo(0,0);'))
      .then(() => element(by.cssContainingText('.m-message-list__action', 'Delete')).click())
      .then(() => clickBtnInModal('Yes I\'m sure'))
      .then(() => browser.wait(EC.presenceOf($('.s-timeline')), 5 * 1000))
      ;
  });
});
