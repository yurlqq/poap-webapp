import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';
import path from 'node:path';
const src = path.resolve(import.meta.dirname, '../src');
export default defineConfig({
 plugins: [ {name:'local-auth',enforce:'pre',resolveId(id, importer){if (id === 'auth' || /(?:^|\/)auth$/.test(id)) return path.resolve(import.meta.dirname,'auth.tsx');}}, react(), svgr() ],
 publicDir: '../public',
 resolve: {alias: ['api','components','images','lib','react-helpers'].map(name=>({find:name,replacement:path.join(src,name)}))},
 define: {global:'globalThis','process.env':JSON.stringify({NODE_ENV:'development',REACT_APP_TEST_API_ROOT:'/local-api',REACT_APP_TEST_API_WEBSITES:'/local-api',REACT_APP_WEBSITES_URL:'http://localhost:4173/local-claim'})},
 server: {fs:{allow:[path.resolve(import.meta.dirname,'..')]}},
 build:{outDir:'dist'},
 css:{preprocessorOptions:{scss:{silenceDeprecations:['legacy-js-api','import','global-builtin','color-functions','slash-div','mixed-decls']}}}
});
