const userUtil = require('../utils/user-util');
const { home } = require('../utils/navigation');

describe('Associate participant to contact', () => {
  const EC = protractor.ExpectedConditions;

  beforeAll(async () => {
    await userUtil.signin();
  });

  beforeEach(async () => {
    await home();
  });

  it('redirect to association page', async () => {
    await browser.wait(
      EC.presenceOf($('.s-timeline .s-discussion-item')),
      5 * 1000
    );
    await element(
      by.cssContainingText(
        '.s-discussion-item__message_excerpt',
        'Les champignons gardent toute leur saveur quand ils'
      )
    ).click();
    await browser.wait(EC.presenceOf($('.s-discussion')), 5 * 1000);
    await element(
      by.css(
        '.s-discussion-action-bar__action[title="Add a participant to the contact book"]'
      )
    ).click();
    await element(
      by.cssContainingText('.m-action-bar__actions .m-link', 'Astérix')
    ).click();
    await browser.wait(EC.presenceOf($('.s-contact-association')), 5 * 1000);
    expect(browser.getCurrentUrl()).toContain(
      '/contact-association/email/asterix@caliopen.local?label=Ast%C3%A9rix'
    );
  });

  it('new contact form', async () => {
    await browser.get(
      '/contact-association/email/asterix@caliopen.local?label=Asterix'
    );
    await browser.wait(EC.presenceOf($('.s-contact-association')), 5 * 1000);
    await element(by.cssContainingText('.m-button', 'Add new contact')).click();
    await browser.wait(EC.presenceOf($('.s-contact__form')), 5 * 1000);
    expect(
      element(by.css('input[name="given_name"]')).getAttribute('value')
    ).toEqual('Asterix');
    expect(
      element(by.css('input[name="emails[0].address"]')).getAttribute('value')
    ).toEqual('asterix@caliopen.local');
  });
});
