const userUtil = require('../utils/user-util');
const { home } = require('../utils/navigation');
const { filter } = require('../utils/timeline');

describe('Delete message', () => {
  const EC = protractor.ExpectedConditions;

  beforeAll(async () => {
    await userUtil.signin();
  });

  beforeEach(async () => {
    await home();
  });

  const clickBtnInModal = (btnText) =>
    element(by.cssContainingText('.m-modal button', btnText)).click();

  it('Delete message one by one', async () => {
    const discussion1Selector = by.cssContainingText(
      '.s-discussion-item__message_subject',
      'remove message one by one'
    );
    const message1ToDel = 'first message to remove individually';
    const message2ToDel = 'last message to remove individually';
    const deleteAMessage = async (messageText) => {
      const messageElem = element(by.cssContainingText('article', messageText));
      await messageElem
        .element(
          by.cssContainingText('.m-message-action-container__action', 'Delete')
        )
        .click();

      return clickBtnInModal("Yes I'm sure");
    };

    // await filter('All');
    await browser.wait(EC.presenceOf($('.s-timeline')), 5 * 1000);
    await element(discussion1Selector).click();
    await browser.wait(EC.presenceOf($('article')), 5 * 1000);
    await deleteAMessage(message1ToDel);
    await browser.wait(EC.presenceOf($('article')), 5 * 1000);
    expect(
      element(by.cssContainingText('article', message1ToDel)).isPresent()
    ).toBe(false);
    await deleteAMessage(message2ToDel);
    await browser.wait(EC.presenceOf($('.s-timeline')), 5 * 1000);
  });

  xit('Delete all messages of a collection', async () => {
    const discussionSelector = by.cssContainingText(
      '.s-discussion-item__message_excerpt',
      'a message of a collection to remove'
    );

    // await filter('All');
    await browser.wait(
      EC.presenceOf($('.s-timeline .s-discussion-item')),
      5 * 1000
    );
    await element(discussionSelector).click();
    await browser.wait(EC.presenceOf($('.m-message-list__action')), 5 * 1000);
    await browser.executeScript('window.scrollTo(0,0);');
    await element(
      by.cssContainingText('.m-message-list__action', 'Delete')
    ).click();
    await clickBtnInModal("Yes I'm sure");
    await browser.wait(EC.presenceOf($('.s-timeline')), 5 * 1000);
  });
});
