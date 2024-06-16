import 'mocha';
import { expect } from 'chai';
import { pathMatcher } from '@/common/url';

describe('Test url', function () {
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
