/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VERSION: string;
  readonly DATE: string;
  /**
   * Backend development mode
   * - `true` indicates the backend of the development mode.
   */
  readonly GO_DEV: boolean;
  readonly DEV_ADMIN_PWD: string;
  readonly PRO_ADMIN_PWD: string;
}

type Key = string | number;

type MenuKey = 'bookmarks' | 'folders' | 'searchEngines' | 'files' | 'logins' | 'settings' | 'about';

type FolderOrder = 'created-time' | 'modified-time' | 'bookmark-total' | 'weight';
type BookmarkOrder = 'created-time' | 'modified-time' | 'visits' | 'folder-weight' | 'weight';
type SearchEngineOrder = 'created-time' | 'modified-time' | 'weight';
type LoginOrder = 'login-time';

type FolderBatchAction = 'delete' | 'setLarge' | 'setPrivacy' | 'setWeight' | 'incWeight' | 'setSortBy';
type BookmarkBatchAction = 'delete' | 'setPrivacy' | 'setHideInOther' | 'setWeight' | 'incWeight' | 'clearVisits' | 'setFolder';
type SearchEngineBatchAction = 'delete' | 'setWeight' | 'incWeight';

type SortByType = 'weight' | 'visits' | 'created_time';

type FolderBatchBody<T = unknown> = BatchBody<T, FolderBatchAction>;
type BookmarkBatchBody<T = unknown> = BatchBody<T, BookmarkBatchAction>;
type SearchEngineBatchBody<T = unknown> = BatchBody<T, SearchEngineBatchAction>;

type SearchEngineMethod = 'GET' | 'POST';

interface PageData {
  pageSize: number;
  pageNo: number;
  total: number;
}

interface FolderBaseData {
  id: number;
  name: string;
  description: string;
  large: boolean;
  privacy: boolean;
  weight: number;
  sortBy: SortByType;
  createdTime: string;
  modifiedTime: string;
}

interface FolderListItem extends FolderBaseData {
  bookmarkTotal: number;
}

interface FolderListData extends PageData {
  list: FolderListItem[];
}

type FolderBody = Omit<FolderBaseData, 'id' | 'createdTime' | 'modifiedTime'>;

interface BookmarkBaseData {
  id: number;
  url: string;
  name: string;
  description: string;
  icon: string;
  privacy: boolean;
  weight: number;
  createdTime: string;
  modifiedTime: string;
  visits: number;
  folderId: number;
  hideInOther: boolean;
}

interface BookmarkListItem extends BookmarkBaseData {
  folderName: string;
}

interface BookmarkListData extends PageData {
  list: BookmarkListItem[];
}

interface BookmarkBody {
  name: string;
  url: string;
  description: string;
  icon: string;
  privacy: boolean;
  hideInOther: boolean;
  weight: number;
  folderId: number;
  files: number[];
  visits?: number;
}

interface BookmarkFolderInfo {
  id: number;
  name: string;
  privacy: boolean;
}

interface FileBaseData {
  id: number;
  path: string;
}

interface BookmarkResData extends BookmarkBaseData {
  files: FileBaseData[];
}

interface SearchEngineBaseData {
  id: number;
  name: string;
  method: SearchEngineMethod;
  url: string;
  body: string;
  icon: string;
  weight: number;
  createdTime: string;
  modifiedTime: string;
}

interface SearchEngineListData extends PageData {
  list: SearchEngineBaseData[];
}

interface SearchEngineBody {
  name: string;
  method: SearchEngineMethod;
  url: string;
  body: string;
  icon: string;
  weight: number;
}

interface SlenderSettings {
  title: string;
  customFooter: string;
  showSidebar: boolean;
  showSearchInput: boolean;
  showScrollTop: boolean;
  showLatest: boolean;
  latestTotal: number;
  showHot: boolean;
  hotTotal: number;
  useLetterIcon: boolean;
  openInNewWindow: boolean;
  internalNetwork: string;
}

interface BatchBody<T = unknown, A extends string> {
  dataSet: Key[];
  action: A;
  payload?: T;
}

interface BookmarkImportItem {
  url: string;
  name: string;
  description: string;
  icon: string;
  privacy: boolean;
  weight: number;
}

interface LoginBaseData {
  loginId: string;
  loginTime: string;
  ip: string;
  ua: string;
  isAdmin: boolean;
  maxAge: number;
  active: boolean | null;
}

interface LoginListData extends PageData {
  list: LoginBaseData[];
}

interface FileListItem extends FileBaseData {
  used: boolean;
}

interface FileListData extends PageData {
  list: FileListItem[];
}

interface Info {
  version: string;
  commit: string;
  os: string;
  arch: string;
  buildDate: string;
}

interface Icons {
  mdiVersion: string;
  siVersion: string;
}
