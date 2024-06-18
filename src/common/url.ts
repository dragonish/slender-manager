interface KeyItem {
  text: string;
  isUrlKey: boolean;
}

const keysReg = new RegExp('{(?:host|hostname|href|origin|pathname|port|protocol)}', 'g');

export const urlKeys: Array<keyof Location> = ['host', 'hostname', 'href', 'origin', 'pathname', 'port', 'protocol'];

export function getLocation(key: keyof Location): string {
  const res = location[key];
  if (typeof res !== 'string') {
    return key;
  }
  return res;
}

export function findUrlKeys(text: string): KeyItem[] {
  const findRes: KeyItem[] = [];
  const len = text.length;
  let res: RegExpExecArray | null,
    pos = 0;

  while ((res = keysReg.exec(text)) !== null) {
    if (res.index > pos) {
      findRes.push({
        text: text.substring(pos, res.index),
        isUrlKey: false,
      });
    }

    findRes.push({
      text: res[0],
      isUrlKey: true,
    });

    pos = keysReg.lastIndex;
  }

  if (pos < len) {
    findRes.push({
      text: text.substring(pos, len),
      isUrlKey: false,
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
