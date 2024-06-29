const Updater = require("auto-git-update");
const fs = require("fs");
const path = require("path");

module.exports = {
  gitUpdate: () => {
    const CurrentTime = new Date().toUTCString();
    fs.appendFileSync(
      __dirname + "/log.txt",
      "\n[" + CurrentTime + "] => " + "Received Auto Update Request \n"
    );
    const config = {
      repository: "https://github.com/Nickeldon/OverStudio",
      fromReleases: true,
      tempLocation: path.resolve("../../OverStudioTemp"),
      //ignoreFiles: ["../electron.js"],
      //executeOnComplete: __dirname  + '../scripts/Reboot.bat',
      exitOnComplete: true,
    };

    try {
      const updater = new Updater(config);
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
  },
};
