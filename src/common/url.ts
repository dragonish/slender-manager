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
