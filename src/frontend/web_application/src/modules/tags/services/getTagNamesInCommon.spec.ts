import { getTagNamesInCommon } from './getTagNamesInCommon';

describe('modules tags - services - getTagNamesInCommon', () => {
  it('getTagNamesInCommon & ignore empty tags', () => {
    const messages = [{ tags: ['foobar', 'bar'] }, {}, { tags: ['foobar'] }];

    const results = getTagNamesInCommon(messages);

    expect(results).toEqual(['foobar']);
  });

  it('getTagNamesInCommon strict', () => {
    const messages = [{ tags: ['foobar', 'bar'] }, {}, { tags: ['foobar'] }];

    const results = getTagNamesInCommon(messages, { strict: true });

    expect(results).toEqual([]);
  });

  it('getTagNamesInCommon only one item', () => {
    const messages = [{ tags: ['foobar', 'bar'] }];

    const results = getTagNamesInCommon(messages, { strict: true });

    expect(results).toEqual(['foobar', 'bar']);
  });
});
