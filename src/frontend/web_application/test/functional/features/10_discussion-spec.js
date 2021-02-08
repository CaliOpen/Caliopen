const userUtil = require('../utils/user-util');
const { home } = require('../utils/navigation');
const { filter } = require('../utils/timeline');

describe('Discussions', () => {
  const EC = protractor.ExpectedConditions;

  beforeAll(async () => {
    await userUtil.signin();
  });

  beforeEach(async () => {
    await home();
  });

  it('List', async () => {
    await browser.wait(
      EC.presenceOf($('.s-timeline .s-discussion-item')),
      5 * 1000
    );
    expect(
      element
        .all(by.css('.s-discussion-item__message_excerpt'))
        .first()
        .getText()
    ).toContain("Fry! Stay back! He's too powerful!");
    expect(element.all(by.css('.s-discussion-item')).count()).toEqual(6);
    expect(
      element(
        by.cssContainingText('.s-timeline__load-more', 'Load more')
      ).isPresent()
    ).toBe(false);
  });

  describe('Thread', () => {
    it('Render and listed contacts describe the thread', async () => {
      // await filter('All');
      await browser.wait(
        EC.presenceOf($('.s-timeline .s-discussion-item')),
        5 * 1000
      );
      element(
        by.cssContainingText(
          '.s-discussion-item__message_excerpt',
          "Fry! Stay back! He's too powerful!"
        )
      ).click();

      expect(
        element(
          by.cssContainingText(
            '.m-navbar-item--is-active .m-navbar-item__content',
            'zoidberg'
          )
        ).isPresent()
      ).toEqual(true);
    });
  });
});
