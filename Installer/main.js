const express = require('express')
const app = express()
const fs = require('fs')
const path = require('path')
const { spawn } = require('child_process');
//const bat = spawn('cmd.exe', ['/c','C:\\scripts\\somescript.bat']);

const cors = require('cors')

const Updater = require("auto-git-update");

app.use(cors())

app.get('/verifyVersion', (req, res) => {
    
    const CurrentTime = new Date().toUTCString();
    fs.appendFileSync(
      __dirname + "/log.txt",
      "\n[" + CurrentTime + "] => " + "Verifying version \n"
    );
    /*const config = {
      repository: "https://github.com/Nickeldon/OverStudio",
      fromReleases: true,
      tempLocation: path.resolve("../OverStudioTemp"),
      //ignoreFiles: ["../electron.js"],
      //executeOnComplete: __dirname  + '../scripts/Reboot.bat',
      exitOnComplete: true,
    };*/
    const updater = new Updater(config);

    updater.compareVersions
    try {
      updater.autoUpdate();
    } catch (e) {
      const CurrentTime = new Date().toUTCString();
      fs.appendFileSync(
        __dirname + "/log.txt",
        "\n[" +
          CurrentTime +
          "] => " +
          "Something Wrong Happened during the Autoupdate \n" +
          JSON.stringify(e) +
          "\n\n"
      );
    }
    
    })