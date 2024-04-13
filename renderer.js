// Import the necessary Electron components.
const contextBridge = require('electron').contextBridge;
const ipcRenderer = require('electron').ipcRenderer;
console.log('renderer.js loaded')
var prevVolState = 0
// White-listed channels.
const ipc = {
    'render': {
        // From render to main.
        'send': [
            'window:minimize', 
            'window:restore',
        ],
        // From main to render.
        'receive': [
            'Play',
            'Pause',
            'Next',
            'Previous',
        ],
        // From render to main and back again.
        'sendReceive': []
    }
};

ipcRenderer.on('Multi-Instance', (event, args) => {
    console.log(typeof args)

    if(args == 'Play' || args == 'Pause') document.getElementById('play-pause').click()
    if(args == 'Next') document.getElementById('next').click()
    if(args == 'Previous') document.getElementById('back').click()
    if(args == 'Mute') {
        console.log(prevVolState)
        if(document.getElementById('volslide').value !== '0'){
        prevVolState = document.getElementById('volslide').value
        document.getElementById('volslide').value = 0
        }
        else{
            console.log('true')
            document.getElementById('volslide').value = prevVolState
        }
        document.getElementById('volslide').dispatchEvent(new Event('input', { bubbles: true }))
    }
})

// Exposed protected methods in the render process.
contextBridge.exposeInMainWorld(
    // Allowed 'ipcRenderer' methods.
    'ipcRender', {
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
        }
    }
);