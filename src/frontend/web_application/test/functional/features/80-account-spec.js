const userUtil = require('../utils/user-util');

describe('Account', () => {
  const EC = protractor.ExpectedConditions;

  beforeAll(async () => {
    await userUtil.signin();
  });

  beforeEach(async () => {
    await userUtil.showAccount();
  });

  it('Change password', async () => {
    await element(
      by.cssContainingText('.l-user .m-nav-list a', 'Security')
    ).click();
    await browser.wait(
      EC.presenceOf(element(by.css('.m-password-details'))),
      5 * 1000
    );

    await element(
      by.cssContainingText('.m-password-details__action .m-button', 'Change')
    ).click();
    await element(
      by.cssContainingText('.m-text-field-group', 'Current password:')
    )
      .element(by.css('.m-input-text'))
      .sendKeys('Foo');
    await element(by.cssContainingText('.m-text-field-group', 'New password:'))
      .element(by.css('.m-input-text'))
      .sendKeys('Bar');
    await element(
      by.cssContainingText('.m-text-field-group', 'New password confirmation:')
    )
      .element(by.css('.m-input-text'))
      .sendKeys('Bar');
    await element(
      by.cssContainingText('.m-button', 'Apply modifications')
    ).click();
    await browser.wait(
      EC.presenceOf(
        element(
          by.cssContainingText('.m-password-details', 'Password strength:')
        )
      ),
      5 * 1000
    );
  });

  describe('Delete account', () => {
    it('Fails because of invalid password', async () => {
      await element(
        by.cssContainingText('.m-button', 'Delete account')
      ).click();
      await browser.wait(
        EC.presenceOf(
          element(by.cssContainingText('.m-modal__title', 'Delete account'))
        ),
        5 * 1000
      );
      await element(by.cssContainingText('.m-text-field-group', 'Password'))
        .element(by.css('.m-input-text'))
        .sendKeys('123');

      await element(
        by.cssContainingText('.m-button', 'Delete my Caliopen account')
      ).click();
      await browser.wait(
        EC.presenceOf(
          element(
            by.cssContainingText(
              '.m-field-group__errors',
              'Unable to delete your account, the given password is incorrect.'
            )
          )
        ),
        5 * 1000
      );
      await element(by.cssContainingText('.m-button', 'Cancel')).click();
    });

    it('Succeed', async () => {
      await element(
        by.cssContainingText('.m-button', 'Delete account')
      ).click();
      await browser.wait(
        EC.presenceOf(
          element(by.cssContainingText('.m-modal__title', 'Delete account'))
        ),
        5 * 1000
      );
      await element(by.cssContainingText('.m-text-field-group', 'Password'))
        .element(by.css('.m-input-text'))
        .sendKeys('123456');

      await element(
        by.cssContainingText('.m-button', 'Delete my Caliopen account')
      ).click();
      await browser.wait(EC.urlContains('/auth/signin'), 5 * 1000);
    });
  });
});
