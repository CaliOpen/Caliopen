const userUtil = require('../utils/user-util');

const capitalize = (str) => `${str.charAt(0).toUpperCase()}${str.slice(1)}`;

describe('Remote Identity Settings', () => {
  const EC = protractor.ExpectedConditions;

  const crudOAuth = async ({ providerName }) => {
    await element(
      by.cssContainingText('.m-provider-button', capitalize(providerName))
    ).click();
    const mainWindow = await browser.getWindowHandle();
    await browser.switchTo().window(`authorization_${providerName}`);
    await element(
      by.cssContainingText('a', `authorize ${providerName}`)
    ).click();
    await browser.switchTo().window(mainWindow);
    let identityElement;
    // eslint-disable-next-line default-case
    switch (providerName) {
      case 'gmail':
        identityElement = element(
          by.cssContainingText('.s-settings-identities__identity', 'dev@gmail')
        );
        break;
      case 'twitter':
        identityElement = element(
          by.cssContainingText('.s-settings-identities__identity', '@dev')
        );
        break;
    }
    await browser.wait(EC.presenceOf(identityElement), 5 * 1000);
    await identityElement
      .element(by.cssContainingText('.m-button', 'Delete'))
      .click();
    await element(by.cssContainingText('.m-button', "Yes I'm sure")).click();
    await browser.wait(EC.stalenessOf(identityElement), 5 * 1000);
    expect(identityElement.isPresent()).toEqual(false);
  };

  beforeAll(async () => {
    await userUtil.signin();
    await userUtil.showAccount('External accounts');
    await browser.wait(EC.presenceOf($('.s-settings-identities')), 5 * 1000);
  });

  it('crud remote email', async () => {
    await element(by.cssContainingText('.m-provider-button', 'Email')).click();
    const newFormElement = element(by.css('.m-new-identity__email-form'));
    await newFormElement
      .element(by.css('input[name=identifier]'))
      .sendKeys('foobar');
    await newFormElement
      .element(by.css('input[name=inserverHostname]'))
      .sendKeys('foobar.bar');
    await newFormElement
      .element(by.css('input[name=inserverPort]'))
      .sendKeys('993');
    await newFormElement
      .element(by.css('input[name=inusername]'))
      .sendKeys('foo');
    await newFormElement
      .element(by.css('input[name=inpassword]'))
      .sendKeys('secret');
    await newFormElement
      .element(by.cssContainingText('.m-button', 'Save'))
      .click();
    const identityElement = element(
      by.cssContainingText('.s-settings-identities__identity', 'foobar')
    );
    await browser.wait(EC.presenceOf(identityElement), 5 * 1000);
    expect(newFormElement.isPresent()).toEqual(false);

    await identityElement
      .element(by.cssContainingText('.m-button', 'Edit'))
      .click();
    expect(
      identityElement
        .element(by.css('input[name=identifier]'))
        .getAttribute('disabled')
    ).toEqual('true');
    await identityElement
      .element(by.css('input[name=inserverHostname]'))
      .sendKeys(' edit');
    await identityElement
      .element(by.cssContainingText('.m-button', 'Save'))
      .click();
    await browser.wait(EC.presenceOf(identityElement), 5 * 1000);
    expect(
      identityElement.element(by.css('input[name=identifier]')).isPresent()
    ).toBe(false);

    await identityElement
      .element(by.cssContainingText('.m-button', 'Delete'))
      .click();
    await element(by.cssContainingText('.m-button', "Yes I'm sure")).click();
    await browser.wait(EC.stalenessOf(identityElement), 5 * 1000);
    expect(identityElement.isPresent()).toEqual(false);
  });

  it('crud oauth gmail', async () => {
    await crudOAuth({ providerName: 'gmail' });
  });

  it('crud oauth twitter', async () => {
    await crudOAuth({ providerName: 'twitter' });
  });
});
