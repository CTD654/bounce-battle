import {zipDirectory} from './zip.mjs';
import fs from 'node:fs';import path from 'node:path';import {fileURLToPath} from 'node:url';import {execFileSync} from 'node:child_process';import {createHash} from 'node:crypto';import {packager} from '@electron/packager';
const root=path.dirname(fileURLToPath(import.meta.url)),stage=path.join(root,'build-input');fs.mkdirSync(stage,{recursive:true});
for(const file of ['main.cjs','runtime.cjs','package.json','index.html','battle.js','fighters.js','sounds.js','sprites.js','stats.html','stats.js','stats.css','icon.ico'])fs.cpSync(path.join(root,file),path.join(stage,file),{recursive:true});
const result=await packager({dir:stage,name:'Bounce Battle',platform:'win32',arch:'x64',out:path.join(root,'releases'),asar:true,prune:false,overwrite:true,icon:path.join(root,'icon.ico'),appVersion:'1.1.0',appCopyright:'Bounce Battle fan game',win32metadata:{CompanyName:'Chace',FileDescription:'Bounce Battle',ProductName:'Bounce Battle'}});
const folder=result[0];fs.copyFileSync(path.join(root,'START HERE.txt'),path.join(folder,'START HERE.txt'));
const zip=path.resolve(root,'..','Bounce-Battle-Windows.zip');await zipDirectory(folder,zip);
