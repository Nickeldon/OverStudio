const electron = require('electron');
const {app, BrowserWindow, contextBridge} = electron
const url = require('url')
const path = require('path');
const electronIpcMain = require('electron').ipcMain;
const instancelimit = app.requestSingleInstanceLock()
const fs = require('fs')
try {
  require(__dirname + "\\src\\server")  
  const date = new Date().toUTCString()
  fs.writeFileSync(__dirname + '\\src\\log.txt', '[' + date + '] => ' + 'Back-End started \n\n')
} catch (e) {
  console.log(e)
  //fs.writeFileSync(__dirname + '\\src\\error.log', '\n' + e)
}


//require('electron-reload')(__dirname,{electron: path.join(__dirname, 'node_modules', '.bin', 'electron')})

let windowObj = null

if (!instancelimit) {
  app.quit()
} else{
  app.on('second-instance', (event, commandLine, workingDirectory) => {
    // Someone tried to run a second instance, we should focus our window.
    if (windowObj) {
      if (windowObj.isMinimized()) windowObj.restore()
      windowObj.focus()
    }
  })
  function createWindow(){
    windowObj = new BrowserWindow({
      width: 1024,
      height: 576,
      maxWidth:1800,
      minWidth: 612,
      alwaysOnTop: false,
      maximizable: false,
      minimizable: false,
      center: true,
      autoHideMenuBar: true,
      resizable: true,
      fullscreenable: false,
      frame: false,
      titleBarStyle: 'hidden',
      transparent: true,
      webPreferences: {
        nodeIntegration: false, // is default value after Electron v5
        contextIsolation: true, // protect against prototype pollution
        enableRemoteModule: false,
      }
    });
    windowObj.loadURL(url.format(path.join(__dirname, 'index.html'))); 
    try {
    windowObj.webContents.openDevTools()
    } catch (e) {
      const date = new Date().toUTCString()
      fs.writeFileSync(__dirname + '\\src\\log.txt', '[' + date + '] => ' + JSON.stringify(e) + '\n\n')
    }
    windowObj.on('closed', () => {
      windowObj = null
    })
  
    //Workaround for frame top-bar glitch (electron 25)
    windowObj.on('blur', () => {
      windowObj.setBackgroundColor('#00000000')
    })
    
    windowObj.on('focus', () => {
      windowObj.setBackgroundColor('#00000000')
    })
    const [w, h] = windowObj.getSize();
    windowObj.setSize(w, h);

    windowObj.on('resize', function () {
        setTimeout(() => {
          var size = windowObj.getSize();
          windowObj.setSize(size[0], parseInt(size[0] * 10 / 9));
        }, 0);
      });
  }
  
  
  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit()
  })
  
  app.on('ready', createWindow);
  
  electronIpcMain.on('window:minimize', () => {
    windowObj.minimize();
  })
  
  electronIpcMain.on('window:restore', () => {
    windowObj.restore();
  })
}
