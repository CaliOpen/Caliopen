const userUtil = require('../utils/user-util');
const { home } = require('../utils/navigation');

describe('Create new contact', () => {
  const EC = protractor.ExpectedConditions;

  beforeAll(async () => {
    await userUtil.signin();
  });

  beforeEach(async () => {
    await home();
  });

  it('New', async () => {
    const name = 'Foobar';
    await element(by.css('.m-navbar-item .m-link[title="Contacts"]')).click();
    await browser.wait(
      EC.presenceOf($('.s-contact-book__action-button')),
      1000
    );
    await element(
      by.cssContainingText('.s-contact-book__action-button', 'Add')
    ).click();
    await browser.wait(
      EC.presenceOf($('.s-contact .m-contact-profile-form')),
      1000
    );
    await element(
      by.css('.m-contact-profile-form__input input[name="given_name"]')
    ).sendKeys(name);
    await browser.wait(
      EC.stalenessOf(
        element(
          by.cssContainingText('.s-contact__action[disabled]', 'Validate')
        )
      ),
      2000
    );
    await element(
      by.cssContainingText('.s-contact__action', 'Validate')
    ).click();
    await browser.wait(
      EC.stalenessOf($('.m-action-bar__loading .m-spinner')),
      1000
    );
    expect(element(by.css('.s-contact-main-title__name')).getText()).toEqual(
      name
    );
  });
});
