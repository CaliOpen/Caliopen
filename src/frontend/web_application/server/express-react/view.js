class View {
  constructor(name, opts = {}) {
    this.defaultEngine = opts.defaultEngine;
    this.name = name;
    this.ext =
      this.defaultEngine[0] !== '.'
        ? `.${this.defaultEngine}`
        : this.defaultEngine;

    this.engine = opts.engines[this.ext];
    // there is no path because components are in memory
    // this prevent express render to throw an error
    this.path = 'in-memory';
  }

  render(options, callback) {
    this.engine(this.name, options, callback);
  }
}

export default View;
