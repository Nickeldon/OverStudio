// Import the necessary Electron components.
const contextBridge = require("electron").contextBridge;
const ipcRenderer = require("electron").ipcRenderer;
var prevVolState = 0;

const ipc = {
  render: {
    send: ["window:minimize", "window:restore", "window:dragged", "window:undragged"],

    receive: ["Play", "Pause", "Next", "Previous"],
  },
};

ipcRenderer.on("Multi-Instance", (event, args) => {
  switch (args.toLowerCase()) {
    case "pstatechange":
      {
        document.getElementById("play-pause").click();
      }
      break;

    case "next":
      {
        document.getElementById("next").click();
      }
      break;

    case "previous":
      {
        document.getElementById("back").click();
      }
      break;

    case "mute":
      {
        if (document.getElementById("volslide").value !== "0") {
          prevVolState = document.getElementById("volslide").value;
          document.getElementById("volslide").value = 0;
        } else {
          document.getElementById("volslide").value = prevVolState;
        }
        document
          .getElementById("volslide")
          .dispatchEvent(new Event("input", { bubbles: true }));
      }
      break;

    case "quit":
      {
        document.getElementById("leave").click();
      }
      break;

    default: {
      return 0;
    }
  }
});

// Exposed protected methods in the render process.
contextBridge.exposeInMainWorld(
  // Allowed 'ipcRenderer' methods.
  "ipcRender",
  {
    // From render to main.
    send: (channel, args) => {
      let validChannels = ipc.render.send;
      if (validChannels.includes(channel)) {
        ipcRenderer.send(channel, args);
      }
    },
    // From main to render.
    receive: (channel, listener) => {
      let validChannels = ipc.render.receive;
      if (validChannels.includes(channel)) {
        // Deliberately strip event as it includes `sender`.
        ipcRenderer.on(channel, (event, ...args) => listener(...args));
      }
    },
    // From render to main and back again.
    invoke: (channel, args) => {
      let validChannels = ipc.render.sendReceive;
      if (validChannels.includes(channel)) {
        return ipcRenderer.invoke(channel, args);
      }
    },
  }
);
