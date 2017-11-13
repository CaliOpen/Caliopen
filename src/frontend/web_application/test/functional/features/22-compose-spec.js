const userUtil = require('../utils/user-util');

describe('Compose new message', () => {
  const EC = protractor.ExpectedConditions;
  const locale = 'en';
  const __ = key => ({
    fr: {
      Compose: 'Écrire',
      save: 'Sauvegarder',
    },
    en: {
      Compose: 'Compose',
      save: 'Save',
    },
  }[locale][key]);

  beforeEach(() => {
    userUtil.signin();
  });

  describe('navigation between drafts', () => {
    it('creates a new draft', () => {
      const text1 = 'Compose creates a new draft';
      const writeButtonSelector = by.cssContainingText('.m-call-to-action__btn', __('Compose'));

      browser.get('/')
      // XXX: click .btn--principal to force :hover callback actions
        .then(() => element(by.css('.m-call-to-action__btn--principal')).click())
        .then(() => element(writeButtonSelector).click())
        .then(() => browser.wait(EC.presenceOf($('.m-new-draft')), 1000))
        .then(() => element.all(by.css('.m-navbar-item .m-item-link'))
          .filter(item => item.getText().then(text => text === __('Compose'))))
        .then(items => expect(items.length).toEqual(1))
        .then(() => {
          console.log('write msg');
          const draftBodyElement1 = element(by.css('.m-discussion-textarea__body'));
          draftBodyElement1.sendKeys(text1);
        })
        .then(() => element(writeButtonSelector).click())
        .then(() => browser.wait(EC.presenceOf($('.m-new-draft')), 1000))
        .then(() => expect(element(by.css('.m-discussion-textarea__body')).getText()).not.toEqual(text1))
        .then(() => element.all(by.css('.m-navbar-item .m-item-link'))
          .filter(item => item.getText().then(text => text === __('Compose'))))
        .then((items) => {
          expect(items.length).toEqual(2);

          return items;
        })
        .then(items => items[0].click())
        .then(() => browser.wait(EC.presenceOf($('.m-new-draft')), 1000))
        .then(() => expect(element(by.css('.m-discussion-textarea__body')).getText()).toEqual(text1))
        ;
    });
  });

  describe('Save a draft and send', () => {
    it('composes a new message with no recipients', () => {
      const text1 = 'new message with no rcpts ';

      const writeButtonSelector = by.cssContainingText('.m-call-to-action__btn', __('Compose'));

      browser.get('/')
      // XXX: click .btn--principal to force :hover callback actions
        .then(() => element(by.css('.m-call-to-action__btn--principal')).click())
        .then(() => element(writeButtonSelector).click())
        .then(() => browser.wait(EC.presenceOf($('.m-new-draft')), 1000))
        .then(() =>
          expect(element(by.cssContainingText('.m-navbar-item', __('Compose'))).isPresent())
            .toEqual(true)
        )
        .then(() => {
          console.log('write msg');
          const draftBodyElement1 = element(by.css('.m-discussion-textarea__body'));
          draftBodyElement1.sendKeys(text1);
        })
        .then(() => element(by.cssContainingText('button', __('save'))).click())

        .then(() => browser.wait(EC.presenceOf($('.m-discussion-textarea__body')), 3 * 1000))
        .then(() => expect(
          element.all(by.css('.m-discussion-textarea__body .m-recipient-list__recipient')).count()
        ).toEqual(0))
        .then(() => {
          const draftBodyElement1 = element(by.css('.m-discussion-textarea__body'));
          expect(draftBodyElement1.getText()).toEqual(text1);
        })
        .then(() => element(by.cssContainingText('.m-navbar-item__content', 'Discussions')).click())
        .then(() => browser.wait(EC.presenceOf($('.s-timeline .s-message-item')), 3 * 1000))
        .then(() => expect(
          element.all(by.cssContainingText('.s-message-item__col-title', text1)).count()
        ).toEqual(1))
      ;
    });

    it('composes a new message with a known recipient', () => {
      const text1 = 'new message for a known recipient';

      const writeButtonSelector = by.cssContainingText('.m-call-to-action__btn', __('Compose'));

      browser.get('/')
      // XXX: click .btn--principal to force :hover callback actions
        .then(() => element(by.css('.m-call-to-action__btn--principal')).click())
        .then(() => element(writeButtonSelector).click())
        .then(() => browser.wait(EC.presenceOf($('.m-new-draft')), 1000))
        .then(() => {
          console.info('search recipient');
          const searchInputElement = element(by.css('.m-recipient-list__search-input'));

          return searchInputElement.sendKeys('ben');
        })
        .then(() => browser.wait(EC.presenceOf($('.m-recipient-list__search-result')), 3 * 1000))
        .then(() => element.all(by.css('.m-recipient-list__search-result')))
        .then(results => results[0].click())
        .then(() => {
          console.info('write msg');
          const draftBodyElement1 = element(by.css('.m-discussion-textarea__body'));
          draftBodyElement1.sendKeys(text1);
        })
        .then(() => element(by.cssContainingText('button', __('save'))).click())
        .then(() => browser.wait(EC.presenceOf($('.m-discussion-textarea__body')), 3 * 1000))
        .then(
          () => element.all(by.css('.m-recipient-list__recipient'))
            .then((items) => {
              expect(items.length).toEqual(1);

              return items;
            }, (err) => {
              throw err;
            })
            .then(items => expect(items[0].getText()).toContain('bender@caliopen.local'))
        )
      ;
    });
  });

  describe('recipient search results manipulation', () => {
    it('has no suggestions for an already selected recipient', () => {
      const writeButtonSelector = by.cssContainingText('.m-call-to-action__btn', __('Compose'));

      browser.get('/')
      // XXX: click .btn--principal to force :hover callback actions
        .then(() => element(by.css('.m-call-to-action__btn--principal')).click())
        .then(() => element(writeButtonSelector).click())
        .then(() => browser.wait(EC.presenceOf($('.m-new-draft')), 1000))
        .then(() => {
          console.info('search recipient');
          const searchInputElement = element(by.css('.m-recipient-list__search-input'));

          return searchInputElement.sendKeys('caliopen');
        })
        .then(() => browser.wait(EC.presenceOf($('.m-recipient-list__search-result')), 3 * 1000))
        .then(() => element(by.cssContainingText('.m-recipient-list__search-result', 'bender@caliopen.local')).click())
        .then(() => {
          const searchInputElement = element(by.css('.m-recipient-list__search-input'));

          return searchInputElement.sendKeys('caliopen');
        })
        .then(() => browser.wait(EC.presenceOf($('.m-recipient-list__search-result')), 3 * 1000))
        .then(() =>
          expect(
            element(
              by.cssContainingText('.m-recipient-list__search-result', 'bender@caliopen.local')
            ).isPresent()
          ).toEqual(false)
        )
        .then(
          () => element.all(by.css('.m-recipient-list__recipient'))
            .then((items) => {
              expect(items.length).toEqual(1);

              return items;
            }, (err) => {
              throw err;
            })
            .then(items => expect(items[0].getText()).toContain('bender@caliopen.local'))
        )
      ;
    });

    it('adds a recipient when clicking outside', () => {
      const writeButtonSelector = by.cssContainingText('.m-call-to-action__btn', __('Compose'));
      const dropdownSelector = by.css('.m-recipient-list__search .m-dropdown');
      const searchTerm = 'ben';

      browser.get('/')
      // XXX: click .btn--principal to force :hover callback actions
        .then(() => element(by.css('.m-call-to-action__btn--principal')).click())
        .then(() => element(writeButtonSelector).click())
        .then(() => browser.wait(EC.presenceOf($('.m-new-draft')), 1000))
        .then(() => {
          console.log('search recipient');
          const searchInputElement = element(by.css('.m-recipient-list__search-input'));

          return searchInputElement.sendKeys(searchTerm);
        })
        .then(() => browser.wait(EC.presenceOf($('.m-recipient-list__search-result')), 3 * 1000))
        .then(() => expect(element(dropdownSelector).isDisplayed()).toEqual(true))
        .then(() => element(by.css('.m-recipient-list__search-input')).click())
        .then(() => expect(element(dropdownSelector).isDisplayed()).toEqual(true))
        .then(() => element(by.cssContainingText('.l-navigation__tab-list .m-navbar-item__content', __('Compose'))).click())
        .then(() => expect(element(dropdownSelector).isDisplayed()).toEqual(false))
        .then(() => expect(element(by.cssContainingText('.m-recipient-list__recipient', searchTerm)).isDisplayed()).toEqual(true))
      ;
    });

    it('can use keyboard arrows to select search result', () => {
      const writeButtonSelector = by.cssContainingText('.m-call-to-action__btn', __('Compose'));
      const searchResultItemsSelector = by.css('.m-recipient-list__search-result');

      browser.get('/')
      // XXX: click .btn--principal to force :hover callback actions
        .then(() => element(by.css('.m-call-to-action__btn--principal')).click())
        .then(() => element(writeButtonSelector).click())
        .then(() => browser.wait(EC.presenceOf($('.m-new-draft')), 1000))
        .then(() => {
          console.log('search recipient');
          const searchInputElement = element(by.css('.m-recipient-list__search-input'));
          const searchPromise = searchInputElement.sendKeys('caliopen')
            .then(() => browser.wait(EC.presenceOf($('.m-recipient-list__search-result')), 3 * 1000));


          return { searchInputElement, searchPromise };
        })
        .then(({ searchInputElement }) =>
          element.all(searchResultItemsSelector)
            .then(items => expect(items[0].getAttribute('class')).toContain('m-button--active'))
            .then(() => searchInputElement.sendKeys(protractor.Key.ARROW_DOWN))
            .then(() => element.all(searchResultItemsSelector))
            .then((items) => {
              expect(items[0].getAttribute('class')).not.toContain('m-button--active');
              expect(items[1].getAttribute('class')).toContain('m-button--active');
            })
            .then(() => searchInputElement.sendKeys(protractor.Key.ARROW_DOWN))
            .then(() => element.all(searchResultItemsSelector))
            .then((items) => {
              expect(items[2].getAttribute('class')).toContain('m-button--active');
            })
            .then(() => searchInputElement.sendKeys(protractor.Key.ARROW_UP, protractor.Key.ENTER))
        )
        .then(
          () => element.all(by.css('.m-recipient-list__recipient'))
            .then((items) => {
              expect(items.length).toEqual(1);

              return items;
            }, (err) => {
              throw err;
            })
            .then(items => expect(items[0].getText()).toContain('zoidberg@caliopen.local'))
        )
      ;
    });
  });
});
