const electron = require("electron");
const { app, BrowserWindow, contextBridge, Tray, Menu, nativeImage, dialog } =
  electron;
const url = require("url");
const path = require("path");
const electronIpcMain = require("electron").ipcMain;
const instancelimit = app.requestSingleInstanceLock();
const fs = require("fs");
var size, tempsize, date;
let config = null;
let throwModuleError = {
  status: false,
  module: null,
};
let dragged = false;

function GenerateSpaces(num) {
  let spaces = " ";
  for (let i = 0; i < num; i++) {
    spaces += " ";
  }
  return spaces;
}
function GenerateBars(num) {
  let bars = "-";
  for (let i = 0; i < num; i++) {
    bars += "-";
  }
  return bars;
}

try {
  config = fs.readFileSync(__dirname + "/main/config.json");
  config = JSON.parse(config);
} catch (e) {
  console.log(e);
}

try {
  require(__dirname + "/main/server");
  var date = new Date().toUTCString();
  if (config.meta.MasterSettings.resetLogAtStartup == true)
    fs.writeFileSync(
      __dirname + "/main/log.txt",
      "[" + date + "] => " + "Back-End started \n\n"
    );
  else {
    fs.appendFileSync(
      __dirname + "/main/log.txt",
      `\n\n${GenerateBars(76)}\n\n[` + date + "] => " + "Back-End started \n\n"
    );
  }
} catch (e) {
  if (e.code == "MODULE_NOT_FOUND") {
    let reqModule = e.message.split("'")[1];
    throwModuleError.module = reqModule;
    throwModuleError.status = true;
  }
  const CurrentTime = new Date().toUTCString();
  fs.appendFileSync(
    __dirname + "/main/log.txt",
    "ERROR: [" + CurrentTime + "] => " + "\n" + e + "\n\n"
  );
}

/*if (config.meta.MasterSettings.isDev)
  require("electron-reload")(__dirname, {
    ignored: [path.join("/src/config.json"), path.join("/main/log.txt"), /node_modules|[/\\]\./],
  });*/

let windowObj = null;
let tray = null;
if (!instancelimit) {
  app.quit();
} else {
  app.on("second-instance", () => {
    if (windowObj) {
      if (windowObj.isMinimized()) windowObj.restore();
      windowObj.focus();
    }
  });
  function createWindow() {
    windowObj = new BrowserWindow({
      width: 1024,
      height: 576,
      maxWidth: 1800,
      minWidth: 612,
      alwaysOnTop: false,
      maximizable: false,
      minimizable: false,
      center: true,
      show: false,
      autoHideMenuBar: true,
      resizable: true,
      fullscreenable: false,
      frame: false,
      titleBarStyle: "hidden",
      transparent: true,
      webPreferences: {
        nodeIntegration: false, // is default value after Electron v5
        contextIsolation: true, // protect against prototype pollution
        enableRemoteModule: false,
        preload: path.join(__dirname, "/renderer/renderer.js"),
      },
    });
    windowObj.loadFile(url.format(path.join(__dirname, "/renderer/index.html")));

    if (config) {
      if (config.meta.MasterSettings.isDev == true) {
        try {
          if (config.meta.MasterSettings.isDev == true) {
            windowObj.webContents.openDevTools();
          }
        } catch (e) {
          var date = new Date().toUTCString();
          fs.writeFileSync(
            __dirname + "/main/log.txt",
            "[" + date + "] => " + JSON.stringify(e) + "\n\n"
          );
        }
      }
    }

    windowObj.on("closed", () => {
      windowObj = null;
    });

    //Workaround for frame top-bar glitch (electron 25)
    windowObj.on("blur", () => {
      windowObj.setBackgroundColor("#00000000");
    });

    windowObj.on("focus", () => {
      windowObj.setBackgroundColor("#00000000");
    });
    const [w, h] = windowObj.getSize();
    windowObj.setSize(w, h);

    windowObj.on("resize", function () {
      if (!dragged) {
        setTimeout(() => {
          size = windowObj.getSize();
          if (tempsize != Math.floor(parseInt(size[0]))) {
            windowObj.setSize(size[0], parseInt((size[0] * 10) / 9));
            tempsize = Math.floor(parseInt(size[0]));
          }
        });
      }
    });

    const readyListener = () => {
      if (app.isReady()) {
        return createTray();
      }
      return setTimeout(readyListener, 250);
    };

    if (config.meta.MasterSettings.enableTray == true) {
      readyListener();
    }

    if (config.meta.MasterSettings.IgnoreCertificates == true) {
      app.commandLine.appendSwitch("ignore-certificate-errors");
    }

    function createTray() {
      if (process.platform === "win32") {
        const image = nativeImage.createFromPath(
          path.join(__dirname, "/Addons/logo/logowin.ico")
        );
        tray = new Tray(image.resize({ width: 256, height: 256 }));
      } else {
        const image = nativeImage.createFromPath(
          path.join(__dirname, "/Addons/logo/logowin.png")
        );
        tray = new Tray(image.resize({ width: 256, height: 256 }));
      }
      const contextMenu = Menu.buildFromTemplate([
        {
          label: "Play",
          click: () => {
            RendererRequest("PStateChange");
          },
        },
        {
          label: "Pause",
          click: () => {
            RendererRequest("PStateChange");
          },
        },
        {
          label: "Next",
          click: () => {
            RendererRequest("Next");
          },
        },
        {
          label: "Previous",
          click: () => {
            RendererRequest("Previous");
          },
        },
        {
          label: "Mute / Unmute",
          click: () => {
            RendererRequest("Mute");
          },
        },
        { type: "separator" },
        {
          label: "Quit",
          click: () => {
            RendererRequest("Quit");
          },
        },
      ]);
      tray.setToolTip("OverStudio");
      tray.setContextMenu(contextMenu);
    }

    windowObj.once("ready-to-show", () => {
      windowObj.show();
    })
  }

  app.on("window-all-closed", () => {
    if (process.platform !== "darwin") app.quit();
  });

  app.on("ready", () => {
    if (throwModuleError.status) {
      dialog.showMessageBoxSync({
        type: "error",
        title: "OverStudio Compile Error",
        message: `Whoops!\nThe module '${throwModuleError.module}' is missing.`,
        detail: `\nPlease install it by running 'npm i ${
          throwModuleError.module
        }' in the terminal.${GenerateSpaces(10)}\n\n`,
        textWidth: 300,
        icon: path.join(__dirname, "/Addons/logo/logowin.png"),
        buttons: ["OK"],
      });
      process.exit(1);
    }
    if (config) {
      try {
        if (config.meta.MasterSettings.HardwareAcceleration == true) {
          app.disableHardwareAcceleration = false;
        } else if (config.meta.MasterSettings.HardwareAcceleration == "false") {
          console.log("Hardware Acceleration Disabled");
          app.disableHardwareAcceleration = true;
        }
      } catch (e) {
        app.disableHardwareAcceleration = false;
      }
    }
    createWindow();
  });

  electronIpcMain.on("window:dragged", () => {
    console.log("window dragged");
    dragged = true;
  });

  electronIpcMain.on("window:undragged", () => {
    console.log("window not dragged");
    dragged = false;
  });

  electronIpcMain.on("window:minimize", () => {
    console.log("received request");
    windowObj.minimize();
  });

  electronIpcMain.on("window:restore", () => {
    console.log("received request 2");
    windowObj.restore();
  });

  function RendererRequest(request) {
    windowObj.webContents.send("Multi-Instance", request);
  }
}
