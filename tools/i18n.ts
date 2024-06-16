import fs from 'node:fs';
import path from 'node:path';
import { exit } from 'node:process';
import { defaultsDeep } from 'lodash-es';

const localesDir = 'src/locales';

function log(content: string) {
  console.info(`[i18n]: ${content}`);
}

function main() {
  log('Copy new language field properties...');
  try {
    const enJson = path.join(localesDir, 'en.json');
    const enFile = fs.readFileSync(enJson, 'utf-8');
    const enObj = JSON.parse(enFile);

    const zhCNJson = path.join(localesDir, 'zh-CN.json');
    const zhCNFile = fs.readFileSync(zhCNJson, 'utf-8');
    const zhCNObj = JSON.parse(zhCNFile);

    defaultsDeep(zhCNObj, enObj);

    const zhCNResult = JSON.stringify(zhCNObj, null, 2) + '\n';
    fs.writeFileSync(zhCNJson, zhCNResult);

    log('Copy done.');
  } catch (err) {
    console.error(err);
    exit(1);
  }
}

main();
