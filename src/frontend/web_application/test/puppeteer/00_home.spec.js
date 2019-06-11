describe('Home', () => {
  beforeAll(async () => {
    // Set the language forcefully on javascript
    // await page.evaluateOnNewDocument(() => {
    //     Object.defineProperty(navigator, "language", {
    //         get: function() {
    //             return ["en-US"];
    //         }
    //     });
    //     Object.defineProperty(navigator, "languages", {
    //         get: function() {
    //             return ["en-US", "en"];
    //         }
    //     });
    // });
    await page.goto('http://localhost:4000/');
  });

  it('Requires authentication', async () => {
    console.log('start');
    await expect(page.title()).resolves.toMatch('Caliopen, be good!');
    const btn = await expect(page).toMatchElement('.s-signin__action .m-button');
    await expect(btn).toMatch('Login');

    console.log('done');
  });
});

// const userUtil = require('../utils/user-util');
//
// describe('Home', () => {
//   const EC = protractor.ExpectedConditions;
//
//   describe('Authentication', () => {
//     afterEach(() => {
//       userUtil.signout();
//     });
//
//     it('Log In', async () => {
//       await userUtil.signin();
//       expect(element(by.css('.m-application-tab [title=Timeline]')).isPresent()).toEqual(true);
//     });
//
//     it('Requires authentication', async () => {
//       browser.get('/');
//       await browser.wait(EC.presenceOf(element(by.css('.s-signin__action'))), 1000);
//
//       expect(element(by.css('.s-signin__action .m-button')).getText()).toContain('Login');
//     });
//
//     it('Log out', async () => {
//       await userUtil.signin();
//       await userUtil.signout();
//       await browser.wait(EC.presenceOf(element(by.css('.s-signin__action'))), 1000);
//
//       expect(element(by.css('.s-signin__action .m-button')).getText()).toContain('Login');
//     });
//   });
//
//   it('Page not found', async () => {
//     await userUtil.signin();
//     await browser.get('/whatever');
//     await browser.wait(EC.presenceOf(element(by.css('.s-page-not-found'))), 5 * 1000);
//
//     expect(element(by.css('.s-page-not-found__title')).isPresent()).toEqual(true);
//   });
// });
