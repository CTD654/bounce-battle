const {app}=require('electron');const {createGameWindow}=require('./runtime.cjs');
app.setName('Bounce Battle');app.setAppUserModelId('com.chace.bouncebattle');
app.whenReady().then(()=>createGameWindow()).catch(error=>{console.error(error);app.exit(1);});
app.on('window-all-closed',()=>app.quit());
