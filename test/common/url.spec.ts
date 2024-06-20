import 'mocha';
import { expect } from 'chai';
import { findUrlKeys, pathMatcher } from '@/common/url';

describe('Test url', function () {
  it('findUrlKeys', function () {
    expect(findUrlKeys('https://{hostname}:8888')).to.deep.eq([
      {
        text: 'https://',
        isUrlKey: false,
      },
      {
        text: '{hostname}',
        isUrlKey: true,
      },
      {
        text: ':8888',
        isUrlKey: false,
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
