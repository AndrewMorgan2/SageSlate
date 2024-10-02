const { remote, dialog, app, contextBridge, ipcRenderer } = require('electron');
const path = require('path');
const fs = require('fs');

contextBridge.exposeInMainWorld('electron', {
  sendRequest: (payload) => ipcRenderer.invoke('send-request', payload),
  sendRequestUltra: (payload) => ipcRenderer.invoke('send-request-ultra', payload),
  sendRequestControl: (payload) => ipcRenderer.invoke('send-request-control', payload),
  sendRequestMoney: (payload) => ipcRenderer.invoke('send-request-money', payload),
  sendCommand: (payload) => ipcRenderer.invoke('execute-command', payload),
  ipcRenderer: {
    send: (channel, ...args) => ipcRenderer.send(channel, ...args),
    on: (channel, listener) => ipcRenderer.on(channel, listener),
    invoke: (channel, ...args) => ipcRenderer.invoke(channel, ...args),
  },
  remote: remote,
  app: app,
  dialog: dialog,
  path: path,
  fs: fs
});
