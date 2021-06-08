import { withI18nProps } from '@lingui/react';
import { searchTags } from './searchTags';

describe('modules tags - services - searchTags', () => {
  it('searchTags', () => {
    const i18n = { _: (id) => id } as withI18nProps['i18n'];
    const userTags = [
      { name: 'foobar', label: 'Foobar' },
      { name: 'bar', label: 'Bar' },
    ];

    const results = searchTags(i18n, userTags, 'foo');

    expect(results).toEqual([userTags[0]]);
  });
});
