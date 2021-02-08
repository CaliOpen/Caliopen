let keypair;

const getBrowserKeypair = () =>
  browser.executeScript(`
    return {
      curve: window.localStorage.getItem('device.curve'),
      hash: window.localStorage.getItem('device.hash'),
      id: window.localStorage.getItem('device.id'),
      priv: window.localStorage.getItem('device.priv'),
    };
  `);

module.exports = {
  clearKeypairInLocalStorage: ({ save = false } = {}) =>
    getBrowserKeypair()
      .then((result) => {
        if (save) {
          keypair = result;
        }
      })
      .then(() =>
        browser.executeScript(`
      window.localStorage.removeItem('device.curve');
      window.localStorage.removeItem('device.hash');
      window.localStorage.removeItem('device.id');
      window.localStorage.removeItem('device.priv');
    `)
      ),
  restoreKeypairInLocalStorage: () => {
    const { curve, hash, id, priv } = keypair;

    return browser.executeScript(`
      window.localStorage.setItem('device.curve', '${curve}');
      window.localStorage.setItem('device.hash', '${hash}');
      window.localStorage.setItem('device.id', '${id}');
      window.localStorage.setItem('device.priv', '${priv}');
    `);
  },
};
