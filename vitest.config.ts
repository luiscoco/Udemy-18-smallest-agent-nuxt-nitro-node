import {defineConfig} from 'vitest/config';
import vue from '@vitejs/plugin-vue';
import {fileURLToPath} from 'node:url';
export default defineConfig({resolve:{alias:{'#shared':fileURLToPath(new URL('./shared',import.meta.url))}},plugins:[vue({template:{transformAssetUrls:false}})],test:{maxWorkers:1,projects:[
 {extends:true,test:{name:'server',environment:'node',include:['tests/server*.test.ts']}},
 {extends:true,test:{name:'client',environment:'jsdom',include:['tests/client*.test.ts'],setupFiles:['tests/setup.ts']}},
]}});
