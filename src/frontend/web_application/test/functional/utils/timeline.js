module.exports = {
  filter: async (type) => {
    await element(
      by.css('#toggle-timeline-filter_navigation_dropdown')
    ).click();

    return element(by.cssContainingText('.m-button', type)).click();
  },
};
