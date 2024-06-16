import 'mocha';
import { expect } from 'chai';
import { routeString, routeInt, routeBool } from '@/common/serializer';

describe('Test serializer', function () {
  it('routeString', function () {
    expect(routeString('1')).to.eq('1');
    expect(routeString('', '0')).to.eq('0');
    expect(routeString(1, '0')).to.eq('0');
    expect(routeString(undefined, '0')).to.eq('0');
    expect(routeString(null, '0')).to.eq('0');
    expect(routeString([], '0')).to.eq('0');
    expect(routeString([])).to.eq('');
  });

  it('routeInt', function () {
    expect(routeInt('1', 0)).to.eq(1);
    expect(routeInt('', 0)).to.eq(0);
    expect(routeInt('1.1', 0)).to.eq(1);
    expect(routeInt(1.1, 0)).to.eq(1);
    expect(routeInt('', 0)).to.eq(0);
    expect(routeInt([], 0)).to.eq(0);
    expect(routeInt('', 1.1)).to.eq(1);
    expect(routeInt(undefined, 0)).to.eq(0);
    expect(routeInt(null, 0)).to.eq(0);
    expect(routeInt(1, 2)).to.eq(2);
    expect(routeInt(4, 2, 3)).to.eq(3);
    expect(routeInt(2, 4, 3)).to.eq(4);
    expect(routeInt(4, 2, 3.3)).to.eq(3);
  });

  it('routeBool', function () {
    expect(routeBool('1')).to.be.true;
    expect(routeBool('yes')).to.be.true;
    expect(routeBool('true')).to.be.true;
    expect(routeBool('on')).to.be.true;
    expect(routeBool('0')).to.be.false;
    expect(routeBool('no')).to.be.false;
    expect(routeBool('false')).to.be.false;
    expect(routeBool('off')).to.be.false;
    expect(routeBool('')).to.be.null;
    expect(routeBool(1)).to.be.true;
    expect(routeBool(0)).to.be.false;
    expect(routeBool(1.1)).to.be.null;
    expect(routeBool(true)).to.be.true;
    expect(routeBool(false)).to.be.false;
    expect(routeBool(undefined)).to.be.null;
    expect(routeBool(null)).to.be.null;
    expect(routeBool([])).to.be.null;
  });
});
