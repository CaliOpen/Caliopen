const { SpecReporter } = require('jasmine-spec-reporter');

const frontUrl = process.env.FRONTEND_ADDRESS || 'localhost';

const cfg = {
  SELENIUM_PROMISE_MANAGER: true,
  multiCapabilities: [
    {
      browserName: 'chrome',
      maxInstances: 1,
      chromeOptions: {
        args: [
          '--no-sandbox',
          '--disable-dev-shm-usage',
          '--disable-gpu',
          '--disable-extensions',
          'lang=en-US',
        ],
        prefs: {
          intl: { accept_languages: 'en-US' },
        },
      },
    },
    // {
    //   browserName: 'firefox',
    //   maxInstances: 1,
    //   "moz:firefoxOptions": {
    //     args: ['-safe-mode', '-headless']
    //   },
    // },
  ],
  specs: ['./features/**/*-spec.js'],
  jasmineNodeOpts: {
    showColors: true,
    // print: () => {},
    defaultTimeoutInterval: 70 * 1000,
  },
  baseUrl: `http://${frontUrl}:4000/`,
  onPrepare: () => {
    browser.ignoreSynchronization = true;
    browser.manage().window().setSize(1024, 768);

    jasmine.getEnv().addReporter(
      new SpecReporter({
        suite: {
          displayNumber: true,
        },
        spec: {
          displayErrorMessages: true,
          displayFailed: true,
          displayStacktrace: true,
        },
        // summary: {
        //   displayErrorMessages: true,
        //   displayStacktrace: true,
        //   displaySuccessful: true,
        //   displayFailed: true,
        // },
      })
    );
  },
  plugins: [
    {
      package: 'protractor-console-plugin',
      failOnWarning: false,
      logWarnings: false,
      exclude: [/Warning:/],
    },
  ],
  logLevel: 'INFO',
  debug: false,
};

if (process.env.SAUCE_USERNAME && process.env.SAUCE_ACCESS_KEY) {
  // platform config: https://wiki.saucelabs.com/display/DOCS/Platform+Configurator#/

  cfg.sauceUser = process.env.SAUCE_USERNAME;
  cfg.sauceKey = process.env.SAUCE_ACCESS_KEY;
  cfg.sauceSeleniumAddress =
    process.env.SAUCE_ADDRESS + ':' + process.env.SAUCE_PORT + '/wd/hub';
  cfg.sauceSeleniumUseHttp = true;
  const branch = process.env.DRONE_BRANCH;
  const prNumber = process.env.DRONE_PULL_REQUEST;
  const name = `CaliOpen e2e - ${prNumber ? `#${prNumber}` : branch}`;

  cfg.multiCapabilities = [
    // ****************************
    // * since openpgp has been added to the bundle, it fails to run on old browsers
    // {
    //   browserName: 'chrome',
    //   platform: 'Linux',
    //   version: '48.0',
    //   'tunnel-identifier': 'caliopen',
    //   name,
    // },
    // {
    //   browserName: 'firefox',
    //   platform: 'Linux',
    //   version: '45.0',
    //   'tunnel-identifier': 'caliopen',
    //   name,
    // },
    // ****************************
    {
      browserName: 'firefox',
      platform: 'Windows 10',
      version: '65.0',
      'tunnel-identifier': 'caliopen',
      name,
      'moz:firefoxOptions': {
        prefs: {
          'security.insecure_password.ui.enabled': false,
          'security.insecure_field_warning.contextual.enabled': false,
        },
      },
    },
    // {
    //   browserName: 'chrome',
    //   platform: 'Windows 10',
    //   version: '72.0',
    //   'tunnel-identifier': 'caliopen',
    //   name,
    // },
    // {
    //   browserName: 'MicrosoftEdge',
    //   platform: 'Windows 10',
    //   version: '16.16299',
    //   'tunnel-identifier': 'caliopen',
    //   name,
    // },
    // {
    //   browserName: 'safari',
    //   platform: 'macOS 10.13',
    //   version: '11.1',
    //   'tunnel-identifier': 'caliopen',
    //   name,
    // }
  ];
}

exports.config = cfg;
