module.exports = {
  switchApp: (application) =>
    element(by.css('.m-application-switcher__toggler'))
      .click()
      .then(() =>
        element(
          by.cssContainingText(
            '.m-application-switcher__dropdown .m-link',
            application
          )
        ).click()
      ),
  home: async () => {
    // force scroll top due to fixed navbar
    await browser.executeScript('window.scrollTo(0,0);');

    return element(by.css('.l-header a[href="/"]')).click();
  },
};
