import dayjs from 'dayjs';
import CustomParseFormat from 'dayjs/plugin/customParseFormat';

dayjs.extend(CustomParseFormat);

/**
 * Converts a route param to a string value.
 * @param inputValue input value
 * @param defaultValue defalult value
 * @returns string value
 */
export function routeString(inputValue: unknown, defaultValue = ''): string {
  if (typeof inputValue === 'string') {
    const res = inputValue.trim();
    if (res) {
      return res;
    }
  }

  return defaultValue;
}

/**
 * Converts a route param to an int value.
 * @param inputValue input value
 * @param minValue min value
 * @param maxValue max value
 * @returns int value
 */
export function routeInt(inputValue: unknown, minValue: number, maxValue?: number): number {
  const minRes = Math.trunc(minValue);
  let res = minRes;

  if (typeof inputValue === 'number') {
    res = Math.trunc(inputValue);
  } else if (typeof inputValue === 'string') {
    res = parseInt(inputValue.trim()) || minRes;
  }

  if (maxValue != undefined) {
    const maxRes = Math.trunc(maxValue);
    if (maxRes > minRes && res > maxRes) {
      res = maxRes;
    }
  }

  if (res < minRes) {
    res = minRes;
  }

  return res;
}

/**
 * Converts a route param to a bool value.
 * - Truthy: ['1', 'yes', 'true', 'on', 1, true]
 * - Falsy: ['0', 'no', 'false', 'off', 0, false]
 * @param inputValue
 * @returns bool value or null
 */
export function routeBool(inputValue: unknown): boolean | null {
  if (typeof inputValue === 'boolean') {
    return inputValue;
  } else if (typeof inputValue === 'number') {
    if (inputValue === 1) {
      return true;
    } else if (inputValue === 0) {
      return false;
    }
  } else if (typeof inputValue === 'string') {
    const truthy = ['1', 'yes', 'true', 'on'];
    const falsy = ['0', 'no', 'false', 'off'];

    const input = inputValue.trim().toLowerCase();
    if (input) {
      if (truthy.includes(input)) {
        return true;
      } else if (falsy.includes(input)) {
        return false;
      }
    }
  }

  return null;
}

/**
 * Get built-in icon.
 * @param name icon name
 * @returns icon web path or empty string
 */
export function getBuiltInIcon(name: string): string {
  const n = name.trim();
  if (n && (n.startsWith('mdi-') || n.startsWith('si-'))) {
    return '/assets/icons/' + n + '.svg';
  }

  return '';
}

export function getExpirationTime(startingTime: string, maxAge: number): string {
  const time = dayjs(startingTime, 'YYYY-MM-DD HH:mm:ss').add(maxAge, 'days');
  return time.format('YYYY-MM-DD HH:mm:ss');
}

export function isExpired(time: string): boolean {
  const now = dayjs();
  const then = dayjs(time, 'YYYY-MM-DD HH:mm:ss');
  return then.isBefore(now);
}
