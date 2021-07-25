import { getSearchParams } from './getSearchParams';

describe('routing > services > getSearchparams', () => {
  it('receive empty string', () => {
    expect(getSearchParams('')).toEqual({});
  });
  it('receive queryString', () => {
    expect(getSearchParams('?foo=bar&fool=baz')).toEqual({
      foo: 'bar',
      fool: 'baz',
    });
  });
  it('receive queryString with number', () => {
    expect(getSearchParams('?foo=bar&fool=3&float=1.33')).toEqual({
      foo: 'bar',
      fool: 3,
      float: 1.33,
    });
  });
  it('receive queryString with multiple values', () => {
    expect(getSearchParams('?foo=bar&foo=3&foo=baz&fool=car')).toEqual({
      foo: ['bar', 3, 'baz'],
      fool: 'car',
    });
  });
  it('receive queryString with no value', () => {
    expect(getSearchParams('?foo=')).toEqual({
      foo: '',
    });
  });
  it('receive not queryString', () => {
    expect(getSearchParams('foo@bar')).toEqual({
      'foo@bar': '',
    });
  });
});
