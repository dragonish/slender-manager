import 'mocha';
import { expect } from 'chai';
import { findKeys, pathMatcher } from '@/common/url';

describe('Test url', function () {
  it('findKeys', function () {
    expect(findKeys('https://{hostname}:8888')).to.deep.eq([
      {
        text: 'https://',
        highlight: false,
      },
      {
        text: '{hostname}',
        highlight: true,
      },
      {
        text: ':8888',
        highlight: false,
      },
    ]);
    expect(findKeys('https://example.com/?w=%s&code=1')).to.deep.eq([
      {
        text: 'https://example.com/?w=%s&code=1',
        highlight: false,
      },
    ]);
    expect(findKeys('https://example.com/?w=%s&code=1', true)).to.deep.eq([
      {
        text: 'https://example.com/?w=',
        highlight: false,
      },
      {
        text: '%s',
        highlight: true,
      },
      {
        text: '&code=1',
        highlight: false,
      },
    ]);
  });

  it('pathMatcher', function () {
    expect(pathMatcher('/abc', '/abc')).to.be.true;
    expect(pathMatcher('/abc', '/abcd')).to.be.false;
    expect(pathMatcher('/abc', '/ab')).to.be.true;
    expect(pathMatcher('/abc', '/abc/')).to.be.false;
    expect(pathMatcher('/abc', ['/abc'])).to.be.true;
    expect(pathMatcher('/abc', ['/ab', '/abcd'])).to.be.true;
    expect(pathMatcher('/abc', ['/abcd', '/abc/'])).to.be.false;
  });
});
