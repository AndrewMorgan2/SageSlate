const electron = require('electron')
// Module to control application life.
const app = electron.app
// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow

const path = require('path')
const url = require('url')
const fs = require('fs');
const ipcMain = require('electron')
const dialog =  require('electron')

const axios = require('axios');
const FormData = require('form-data');

const { exec } = require('child_process');

const remoteMain = require('@electron/remote/main');
remoteMain.initialize();

const userData = "/mnt/a/Projects/TTRPG/TTRPGGadgets/"
const aiImagePath = "/home/jp19050/Github/TTRPG/DnD_Images/Multiple_Images/image_gen"

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow

function executeCommand(command) {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        reject(`error: ${error.message}`);
        return;
      }
      if (stderr) {
        reject(`stderr: ${stderr}`);
        return;
      }
      resolve(stdout);
    });
  });
}
function createWindow () {
  // Create the browser window.
  let mainWindow = new BrowserWindow({width: 1000, height: 660, frame: false, titleBarStyle: 'hidden', titleBarOverlay: true,  webPreferences: {
    preload: path.join(__dirname, 'preload.js'),
    contextIsolation: true, // Important for security
    enableRemoteModule: false, // Disable remote module for security
    sandbox:false,
    icon: path.join(__dirname + "icon.png")
  }})

  // and load the index.html of the app.
  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'front-end/draw.html'),
    protocol: 'file:',
    slashes: true
  }))

  // Open the DevTools.
  mainWindow.webContents.openDevTools()

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null
  })

  ipcMain.ipcMain.handle('execute-command', async (event, command) => {
    try {
      const result = await executeCommand(command);
      return result;
    } catch (error) {
      console.error(error);
      throw error;
    }
  });

  ipcMain.ipcMain.handle('send-request-money', async (event, payload) => {
    const { apiKey } = payload;
    const response = await fetch(`https://api.stability.ai/v1/user/balance`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    })

    if (!response.ok) {
      throw new Error(`Non-200 response: ${await response.text()}`)
    }
    
    const balance = (await response.json());

    return balance;
  });

  ipcMain.ipcMain.handle('send-request', async (event, payload) => {
    const { prompt, output_format, apiKey } = payload;
    try {
      event.sender.send('start-spinner');
      const response = await axios.postForm(
        `https://api.stability.ai/v2beta/stable-image/generate/core`,
        axios.toFormData(payload, new FormData()),
        {
          validateStatus: undefined,
          responseType: "arraybuffer",
          headers: { 
            Authorization: `Bearer ${apiKey}`, //sk-y8QwtozpBnQkSBhN1S6hJGvTy1W0P1hSlohqOqgurc4PkThR`, 
            Accept: "image/*" 
          },
        },
      );

      event.sender.send('stop-spinner');
    
      if(response.status === 200) {
        let first30Chars = prompt.substring(0, 60);
        const dirPath = path.join(aiImagePath, first30Chars);
        fs.mkdirSync(dirPath, { recursive: true });
        const filePath = path.join(dirPath, '1.png');
        fs.writeFileSync(filePath, Buffer.from(response.data));
        event.returnValue = `file://${filePath}`;
        return `file://${filePath}`;
      } else {
        throw new Error(`${response.status}: ${response.data.toString()}`);
      }
    } catch (error) {
      console.error('Request error:', error);
      throw error;
    }
  });

  ipcMain.ipcMain.handle('send-request-ultra', async (event, payload) => {
    const { prompt, output_format } = payload;
    try {
      event.sender.send('start-spinner');
      const response = await axios.postForm(
        `https://api.stability.ai/v2beta/stable-image/generate/ultra`,
        axios.toFormData(payload, new FormData()),
        {
          validateStatus: undefined,
          responseType: "arraybuffer",
          headers: { 
            Authorization: `Bearer sk-y8QwtozpBnQkSBhN1S6hJGvTy1W0P1hSlohqOqgurc4PkThR`, 
            Accept: "image/*" 
          },
        },
      );
      
      event.sender.send('stop-spinner');

      if(response.status === 200) {
        let first30Chars = prompt.substring(0, 60);
        const dirPath = path.join(aiImagePath, first30Chars);
        fs.mkdirSync(dirPath, { recursive: true });
        const filePath = path.join(dirPath, '1.png');
        fs.writeFileSync(filePath, Buffer.from(response.data));
        event.returnValue = `file://${filePath}`;
        return `file://${filePath}`;
      } else {
        throw new Error(`${response.status}: ${response.data.toString()}`);
      }
    } catch (error) {
      console.error('Request error:', error);
      throw error;
    }
  });

  ipcMain.ipcMain.handle('send-request-control', async (event, payload) => {
    const { prompt, output_format, image } = payload;
    try {
      event.sender.send('start-spinner');
      const form = new FormData();
      form.append('prompt', prompt);
      form.append('output_format', output_format);
      form.append('image', fs.createReadStream(image)); // Ensure image is added correctly
  
      const response = await axios.post(
        `https://api.stability.ai/v2beta/stable-image/control/sketch`,
        form,
        {
          validateStatus: undefined,
          responseType: "arraybuffer",
          headers: { 
            Authorization: `Bearer sk-y8QwtozpBnQkSBhN1S6hJGvTy1W0P1hSlohqOqgurc4PkThR`, 
            Accept: "image/*",
            ...form.getHeaders(),
          },
        },
      );
      
      event.sender.send('stop-spinner');

      if(response.status === 200) {
        let first30Chars = prompt.substring(0, 60);
        const dirPath = path.join(aiImagePath, first30Chars);
        fs.mkdirSync(dirPath, { recursive: true });
        const filePath = path.join(dirPath, '1.png');
        fs.writeFileSync(filePath, Buffer.from(response.data));
        event.returnValue = `file://${filePath}`;
        return `file://${filePath}`;
      } else {
        throw new Error(`${response.status}: ${response.data.toString()}`);
      }
    } catch (error) {
      console.error("Oh God", error);
      throw error;
    }
  });

  ipcMain.ipcMain.on('navigate-to', (event, page) => {
    mainWindow.loadFile(page);
  });

  ipcMain.ipcMain.on('minimize-window', () => {
    mainWindow.minimize();
  });

  ipcMain.ipcMain.on('maximize-window', () => {
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize();
    } else {
      mainWindow.maximize();
    }
  });

  ipcMain.ipcMain.on('close-window', () => {
    mainWindow.close();
  });

  ipcMain.ipcMain.handle('get-directories', async (event, dirPath) => {
    try {
      const files = fs.readdirSync(dirPath, { withFileTypes: true });
      const directories = files.filter(dirent => dirent.isDirectory()).map(dirent => dirent.name);
      return directories;
    } catch (error) {
      console.error('Error reading directory:', error);
      return [];
    }
  });

  ipcMain.ipcMain.handle('get-files', async (event, dirPath) => {
    try {
      const files = fs.readdirSync(dirPath, { withFileTypes: true });
      const fileList = files.filter(dirent => dirent.isFile()).map(dirent => dirent.name);
      return fileList;
    } catch (error) {
      console.error('Error reading directory:', error);
      return [];
    }
  });

  ipcMain.ipcMain.handle('open-folder-dialog', async () => {
    const result = await dialog.dialog.showOpenDialog(mainWindow, {
      properties: ['openDirectory']
    });
    return result.filePaths[0];
  });

  ipcMain.ipcMain.handle('save-selected-folder', async (event, folderPath) => {
    const filePath = path.join(userData, 'selectedFolder.txt');
    fs.writeFileSync(filePath, folderPath);
  });
  
  ipcMain.ipcMain.handle('load-selected-folder', async () => {
    const filePath = path.join(userData, 'selectedFolder.txt');
    if (fs.existsSync(filePath)) {
      return fs.readFileSync(filePath, 'utf-8');
    }
    return null;
  });
  
  ipcMain.ipcMain.handle('get-images-in-folder', async (event, folderPath) => {
    if (!fs.existsSync(folderPath)) return [];
    const files = fs.readdirSync(folderPath);
    return files.filter(file => /\.(jpg|jpeg|png|gif)$/.test(file));
  });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

app.setName('Behind the Screen');

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
