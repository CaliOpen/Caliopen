module.exports = {
  launch: {
    dumpio: true,
    headless: process.env.HEADLESS !== 'false',
    args: ['--lang=en'],
    defaultArgs: ['--lang=en'],
  },
  browserContext: 'default',
};
