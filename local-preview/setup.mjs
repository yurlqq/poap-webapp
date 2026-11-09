import { existsSync, symlinkSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
const rootModules=fileURLToPath(new URL('../node_modules',import.meta.url));
if(!existsSync(rootModules))symlinkSync('local-preview/node_modules',rootModules,'dir');
