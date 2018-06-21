import React from 'react';
import { shallow } from 'enzyme';
import Highlights from './';

describe('parseHighlight', () => {
  it('render an highlighted string', () => {
    const highlights = 'azertyuiop, bar qsdfgh jklm.Foo wxcvbn';
    const terms = 'foo bar';
    const comp = shallow(
      <Highlights highlights={highlights} term={terms} />
    );

    expect(comp.text()).toEqual(highlights);
    expect(comp.html()).toEqual('<span><span>azertyuiop, </span><span><b class="s-search-results-highlights__term">bar</b></span><span> qsdfgh jklm.</span><span><b class="s-search-results-highlights__term">Foo</b></span><span> wxcvbn</span></span>');
  });

  it('render an highlighted string w/ terms at begining and end', () => {
    const highlights = 'fooazertyuiop, bar qsdfgh jklm.Foo wxcvbn bar';
    const terms = 'foo bar';
    const comp = shallow(
      <Highlights highlights={highlights} term={terms} />
    );

    expect(comp.text()).toEqual(highlights);
    expect(comp.html()).toEqual('<span><span></span><span><b class="s-search-results-highlights__term">foo</b></span><span>azertyuiop, </span><span><b class="s-search-results-highlights__term">bar</b></span><span> qsdfgh jklm.</span><span><b class="s-search-results-highlights__term">Foo</b></span><span> wxcvbn </span><span><b class="s-search-results-highlights__term">bar</b></span></span>');
  });

  it('render with no terms', () => {
    const highlights = 'fooazertyuiop, bar qsdfgh jklm.Foo wxcvbn bar';
    const comp = shallow(
      <Highlights highlights={highlights} />
    );

    expect(comp.text()).toEqual(highlights);
    expect(comp.html()).toEqual('<span><span>fooazertyuiop, bar qsdfgh jklm.Foo wxcvbn bar</span></span>');
  });

  it('render with nothing', () => {
    const comp = shallow(
      <Highlights />
    );

    expect(comp.text()).toEqual('');
    expect(comp.html()).toEqual(null);
  });

  it('render with a trailing space', () => {
    const highlights = 'azertyuiop, bar qsdfgh jklm.Foo wxcvbn';
    const terms = 'foo bar ';
    const comp = shallow(
      <Highlights highlights={highlights} term={terms} />
    );

    expect(comp.text()).toEqual(highlights);
    expect(comp.html()).toEqual('<span><span>azertyuiop, </span><span><b class="s-search-results-highlights__term">bar</b></span><span> qsdfgh jklm.</span><span><b class="s-search-results-highlights__term">Foo</b></span><span> wxcvbn</span></span>');
  });
});
