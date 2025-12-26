import 'mocha';
import { expect } from 'chai';
import { findKeys, pathMatcher, getDomain } from '@/common/url';

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

  it('getDomain', function () {
    expect(getDomain('test.example.com')).to.eq('example.com');
    expect(getDomain('abc.test.example.com')).to.eq('test.example.com');
    expect(getDomain('example.com')).to.eq('example.com');
    expect(getDomain('192.168.1.1')).to.eq('192.168.1.1');
    expect(getDomain('127.0.0.1')).to.eq('127.0.0.1');
    expect(getDomain('localhost')).to.eq('localhost');
    expect(getDomain('::1')).to.eq('::1');
  });
});
