const userUtil = require('../utils/user-util');
const { home } = require('../utils/navigation');

// make sure jasmin's defaultTimeoutInterval is under this value
const THROTTLE_DURATION = 50 * 1000; // cf. src/modules/notification/services/notification.worker

// FIXME: Works fine on dev env, nothing appears on CI
// disabled since it is a very long test
xdescribe('Notification', () => {
  const EC = protractor.ExpectedConditions;
  const resetNotif = () =>
    browser.executeScript(`
    const req = new XMLHttpRequest();
    req.open('GET', '/api/v2/notifications/reset-dev');
    return req.send();
  `);

  beforeAll(async () => {
    await userUtil.signin();
  });

  beforeEach(async () => {
    await home();
    await resetNotif();
  });

  describe('Timeline', () => {
    it('shows N new messages and clear', async () => {
      await browser.wait(
        EC.presenceOf(
          element(by.cssContainingText('.s-timeline__new-msg', 'new messages'))
        ),
        THROTTLE_DURATION
      );
      expect(
        element(
          by.cssContainingText(
            '.s-timeline__new-msg',
            'You have 4 new messages'
          )
        ).isPresent()
      ).toEqual(true);
      expect(
        element(
          by.css('.l-notification-center__notification-item-message')
        ).isPresent()
      ).toEqual(false);
      await element(
        by.cssContainingText('.s-timeline__new-msg', 'You have 4 new messages')
      ).click();
      await browser.wait(
        EC.stalenessOf(element(by.css('.s-timeline__new-msg'))),
        1000
      );
    });
  });

  // XXX: discussion is like everywhere in app cf. MessageNotifier::PATHS_TO_IGNORE
  xdescribe('Discussion', () => {
    it('shows N new messages and clear', async () => {
      await browser.wait(
        EC.presenceOf($('.s-timeline .s-discussion-item')),
        5 * 1000
      );
      await element(
        by.cssContainingText(
          '.s-discussion-item .s-discussion-item__title .s-discussion-item__message_excerpt',
          'msg with notifications'
        )
      ).click();
      await browser.wait(
        EC.presenceOf(
          element(by.cssContainingText('.m-message', 'new messages'))
        ),
        THROTTLE_DURATION
      );
      expect(
        element(
          by.cssContainingText('.m-message', 'new messages for the discussion')
        ).isPresent()
      ).toEqual(true);
      expect(
        element(
          by.cssContainingText('.m-message', 'new other messages')
        ).isPresent()
      ).toEqual(false);
      expect(element(by.css('.notification')).isPresent()).toEqual(false);
      await element(
        by.cssContainingText('.m-message', 'new messages for the discussion')
      ).click();
      expect(
        element(by.cssContainingText('.m-message', 'new messages')).isPresent()
      ).toEqual(false);
    });

    it('shows N new messages and a specific note for other discussion', async () => {
      await browser.wait(
        EC.presenceOf($('.s-timeline .s-discussion-item')),
        5 * 1000
      );
      await element(
        by.cssContainingText(
          '.s-discussion-item .s-discussion-item__title .s-discussion-item__message_excerpt',
          'msg with notifications'
        )
      ).click();
      await browser.wait(
        EC.presenceOf(
          element(by.cssContainingText('.m-message', 'new messages'))
        ),
        THROTTLE_DURATION
      );
      expect(
        element(
          by.cssContainingText('.m-message', 'new messages for the discussion')
        ).isPresent()
      ).toEqual(true);
      expect(
        element(
          by.cssContainingText('.m-message', 'new other messages')
        ).isPresent()
      ).toEqual(true);
      expect(element(by.css('.notification')).isPresent()).toEqual(false);
    });

    it('shows a notification', async () => {
      await browser.wait(
        EC.presenceOf($('.s-timeline .s-discussion-item')),
        5 * 1000
      );
      await element(
        by.cssContainingText(
          '.s-discussion-item .s-discussion-item__title .s-discussion-item__message_excerpt',
          'other msg'
        )
      ).click();
      await browser.wait(
        EC.presenceOf(
          element(
            by.cssContainingText('.m-message', 'You received 4 new messages')
          )
        )
      );
      expect(
        element(by.cssContainingText('.m-message', 'new messages')).isPresent()
      ).toEqual(false);
      expect(element(by.css('.notification')).isPresent()).toEqual(true);
    });
  });

  describe('Everywhere', () => {
    it('shows a notification', async () => {
      await element(by.css('.m-navbar-item .m-link[title="Contacts"]')).click();
      await browser.wait(
        EC.presenceOf(
          element(by.css('.l-notification-center__notification-item-message'))
        ),
        THROTTLE_DURATION
      );
      expect(
        element(
          by.css('.l-notification-center__notification-item-message')
        ).getText()
      ).toContain('You received 4 new messages');
    });
  });
});
