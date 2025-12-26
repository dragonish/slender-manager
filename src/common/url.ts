interface highlightItem {
  text: string;
  highlight: boolean;
}

const urlReg = new RegExp('{(?:host|hostname|domain|href|origin|pathname|port|protocol)}', 'g');
const placeholderReg = new RegExp('%s', 'g');

export const urlKeys: Array<URLKey> = ['host', 'hostname', 'domain', 'href', 'origin', 'pathname', 'port', 'protocol'];

export function getLocation(key: URLKey): string {
  if (key === 'domain') {
    return getDomain(location.hostname);
  } else {
    const res = location[key];
    if (typeof res !== 'string') {
      return key;
    }
    return res;
  }
}

export function getDomain(hostname: string): string {
  const parts = hostname.split('.');
  const partsLen = parts.length;
  if (partsLen <= 2) {
    return hostname;
  } else if (partsLen === 4 && /^\d+\.\d+\.\d+\.\d+$/.test(hostname)) {
    return hostname;
  }

  return parts.splice(1).join('.');
}

export function findKeys(text: string, isPlaceholder = false): highlightItem[] {
  const findRes: highlightItem[] = [];
  const len = text.length;
  let res: RegExpExecArray | null,
    pos = 0;

  const reg = isPlaceholder ? placeholderReg : urlReg;

  while ((res = reg.exec(text)) !== null) {
    if (res.index > pos) {
      findRes.push({
        text: text.substring(pos, res.index),
        highlight: false,
      });
    }

    findRes.push({
      text: res[0],
      highlight: true,
    });

    pos = reg.lastIndex;
  }

  if (pos < len) {
    findRes.push({
      text: text.substring(pos, len),
      highlight: false,
    });
  }

  return findRes;
}

/**
 * Path matcher.
 * @param curPath current path
 * @param pathOrList a path or path list
 * @returns `true` if match
 */
export function pathMatcher(curPath: string, pathOrList: string | string[]): boolean {
  if (Array.isArray(pathOrList)) {
    for (const item of pathOrList) {
      return curPath.includes(item);
    }
    return false;
  } else {
    return curPath.includes(pathOrList);
  }
}
