import { writeFile } from 'fs';
import { config } from 'dotenv';

import { custom } from './package.json';

config();

const app = 'nip05';
const name = custom[app].name;
const version = custom[app].version;

function genString(production: boolean): string {
  return `export const environment = {
    apiUrl: '${process.env['NIP05_API_URL']}',
    production: ${production},
    name: '${name}',
    version: '${version}'
  };
  `;
}

const environmentFile = genString(false);
const environmentProdFile = genString(true);

console.log(environmentFile);
// Generate environment.ts file
writeFile(
  `./packages/${app}/src/environments/environment.ts`,
  environmentFile,
  function (err) {
    if (err) {
      throw console.error(err);
    }
  }
);

console.log(environmentProdFile);
// Generate environment.prod.ts file
writeFile(
  `./packages/${app}/src/environments/environment.prod.ts`,
  environmentProdFile,
  function (err) {
    if (err) {
      throw console.error(err);
    }
  }
);

console.log(`Angular environment.ts and environment.prod.ts generated`);
