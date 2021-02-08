const { signin, signout } = require('../utils/user-util');
const { showSettings } = require('../utils/user-util');
const {
  clearKeypairInLocalStorage,
  restoreKeypairInLocalStorage,
} = require('../utils/window');

describe('Device', () => {
  const EC = protractor.ExpectedConditions;

  it('Redirect to device management on a new device for an existing account', async () => {
    await signin();
    await expect(browser.getCurrentUrl()).not.toContain('/settings/new-device');
    await clearKeypairInLocalStorage({ save: true });
    await signin();
    await expect(browser.getCurrentUrl()).toContain('/settings/new-device');
    await restoreKeypairInLocalStorage();
    await signin();
    await expect(browser.getCurrentUrl()).not.toContain('/settings/new-device');
    // delete the created device
    await showSettings('Devices');
    const deviceBlock = element(
      by.cssContainingText('.s-devices-settings__device', 'desktop 2')
    );
    await deviceBlock
      .element(by.cssContainingText('.m-button', 'Revoke this device'))
      .click();
    await browser.wait(
      EC.presenceOf(
        element(
          by.cssContainingText(
            '.l-notification-center',
            'The device has been revoked'
          )
        )
      ),
      5 * 1000
    );
  });

  describe('Revoke on a verified device', () => {
    beforeEach(async () => {
      await signin();
    });

    it('Revoke an other device', async () => {
      await showSettings('Devices');
      await expect(
        element.all(by.css('.s-devices-settings__device')).count()
      ).toEqual(2);
      const deviceBlock = element(
        by.cssContainingText('.s-devices-settings__device', 'device to revoke')
      );
      await deviceBlock
        .element(by.cssContainingText('.m-button', 'Revoke this device'))
        .click();
      await browser.wait(
        EC.presenceOf(
          element(
            by.cssContainingText(
              '.l-notification-center',
              'The device has been revoked'
            )
          )
        ),
        5 * 1000
      );
      expect(
        element.all(by.css('.s-devices-settings__device')).count()
      ).toEqual(1);
    });
  });

  describe('Revoke on a unverified device', () => {
    it('Hides the button except itself', async () => {
      await signin(); // create default
      await clearKeypairInLocalStorage({ save: true });
      await signin();
      await clearKeypairInLocalStorage();
      await signin();
      await browser.wait(
        EC.presenceOf(element(by.css('.s-new-device-info')), 5 * 1000)
      );
      await element(by.cssContainingText('.m-link', 'I understand')).click();
      await browser.wait(
        EC.presenceOf(element(by.css('.s-devices-settings__device')), 5 * 1000)
      );
      const nbDevices = await element
        .all(by.css('.s-devices-settings__device'))
        .count();
      const deviceBlock = element(
        by.cssContainingText(
          '.s-devices-settings__device',
          `desktop ${nbDevices - 2}`
        )
      );
      expect(
        deviceBlock
          .element(by.cssContainingText('.m-button', 'Revoke this device'))
          .isPresent()
      ).toEqual(false);
      const deviceBlock2 = element(
        by.cssContainingText(
          '.s-devices-settings__device',
          `desktop ${nbDevices - 1}`
        )
      );
      expect(
        deviceBlock2
          .element(by.cssContainingText('.m-button', 'Revoke this device'))
          .isPresent()
      ).toEqual(true);
      // clear created devices
      await restoreKeypairInLocalStorage();
      await signin();
      await showSettings('Devices');
      const deviceBlock3 = element(
        by.cssContainingText(
          '.s-devices-settings__device',
          `desktop ${nbDevices - 2}`
        )
      );
      await deviceBlock3
        .element(by.cssContainingText('.m-button', 'Revoke this device'))
        .click();
      const deviceBlock4 = element(
        by.cssContainingText(
          '.s-devices-settings__device',
          `desktop ${nbDevices - 1}`
        )
      );
      await deviceBlock4
        .element(by.cssContainingText('.m-button', 'Revoke this device'))
        .click();
      await browser.wait(
        EC.presenceOf(
          element(
            by.cssContainingText(
              '.l-notification-center',
              'The device has been revoked'
            )
          )
        ),
        5 * 1000
      );
    });

    it('Revoke the device then redirect to signout', async () => {
      await signin();
      await clearKeypairInLocalStorage({ save: true });
      await signin();
      await browser.wait(
        EC.presenceOf(element(by.css('.s-new-device-info')), 5 * 1000)
      );
      await element(by.cssContainingText('.m-link', 'I understand')).click();
      const nbDevices = await element
        .all(by.css('.s-devices-settings__device'))
        .count();
      const deviceBlock = element(
        by.cssContainingText(
          '.s-devices-settings__device',
          `desktop ${nbDevices - 1}`
        )
      );
      await deviceBlock
        .element(by.cssContainingText('.m-button', 'Revoke this device'))
        .click();
      expect(browser.getCurrentUrl()).toContain('signin');
      await restoreKeypairInLocalStorage();
    });
  });

  describe('Validate device', () => {
    beforeAll(async () => {
      await signin();
    });

    it('request validation', async () => {
      await showSettings('Devices');
      await element(
        by.cssContainingText('.m-device-verify__button', 'Verify this device')
      ).click();
      await browser.wait(
        EC.presenceOf(
          element(
            by.cssContainingText(
              '.l-notification-center',
              'An email has been sent to your backup email in order to verify the device.'
            )
          ),
          5 * 1000
        )
      );
    });

    it('verify with valid token not authenticated', async () => {
      await signout();
      await browser.get('/validate-device/aaaa-bbbb');
      await signin();
      await browser.wait(
        EC.presenceOf(
          element(
            by.cssContainingText(
              '.s-validate-device',
              'The device is now verified, you can continue to use Caliopen.'
            )
          ),
          5 * 1000
        )
      );
    });

    it('verify with valid token', async () => {
      await browser.get('/validate-device/aaaa-bbbb');
      await browser.wait(
        EC.presenceOf(
          element(
            by.cssContainingText(
              '.s-validate-device',
              'The device is now verified, you can continue to use Caliopen.'
            )
          ),
          5 * 1000
        )
      );
    });

    it('verify with an invalid token', async () => {
      await browser.get('/validate-device/foobar');
      await browser.wait(
        EC.presenceOf(
          element(
            by.cssContainingText(
              '.s-validate-device',
              'The device cannot be verified, the validation link might not be valid anymore or may be the device has been revoked. You can send the verification link from the device list'
            )
          ),
          5 * 1000
        )
      );
    });

    it('verification crashed', async () => {
      await browser.get('/validate-device/fail');
      await browser.wait(
        EC.presenceOf(
          element(
            by.cssContainingText(
              '.s-validate-device',
              'The device cannot be verified, the validation link might not be valid anymore or may be the device has been revoked. You can send the verification link from the device list'
            )
          ),
          5 * 1000
        )
      );
    });
  });
});
