const {BrowserWindow,Menu,protocol,net,app}=require('electron');
const path=require('node:path');const {pathToFileURL}=require('node:url');
protocol.registerSchemesAsPrivileged([{scheme:'app',privileges:{standard:true,secure:true,supportFetchAPI:true,stream:true}}]);
let registered=false;
async function createGameWindow({show=true,offscreen=false}={}){
 if(!registered){const root=__dirname;protocol.handle('app',async request=>{try{const url=new URL(request.url);if(url.hostname!=='bounce-battle')return new Response('Not found',{status:404});const route=decodeURIComponent(url.pathname),file=path.resolve(root,'.'+(route==='/'?'/index.html':route));if(!file.startsWith(root+path.sep))return new Response('Not found',{status:404});return await net.fetch(pathToFileURL(file).href);}catch{return new Response('Not found',{status:404});}});registered=true;}
 const win=new BrowserWindow({width:1040,height:930,minWidth:720,minHeight:620,show:false,title:'Bounce Battle',backgroundColor:'#0b1019',icon:path.join(__dirname,'icon.ico'),autoHideMenuBar:true,webPreferences:{nodeIntegration:false,contextIsolation:true,sandbox:true,backgroundThrottling:false,zoomFactor:0.8,offscreen}});
 win.webContents.setWindowOpenHandler(()=>({action:'deny'}));
 win.webContents.on('will-navigate',(event,url)=>{if(!url.startsWith('app://bounce-battle/'))event.preventDefault();});
 win.webContents.session.setPermissionRequestHandler((_contents,_permission,callback)=>callback(false));
 const page=pathname=>win.loadURL('app://bounce-battle/'+pathname);
 const menu=Menu.buildFromTemplate([{label:'Game',submenu:[{label:'Battle',click:()=>page('')},{label:'Fighter Stats',click:()=>page('stats.html')},{type:'separator'},{label:'Full Screen',accelerator:'F11',click:()=>win.setFullScreen(!win.isFullScreen())},{type:'separator'},{role:'quit',label:'Exit'}]},{label:'View',submenu:[{role:'reload'},{role:'resetZoom'},{role:'zoomIn'},{role:'zoomOut'}]}]);
 Menu.setApplicationMenu(menu);
 await page('');if(show)win.show();return win;
}
module.exports={createGameWindow};
