
document.getElementById('minimize-button').addEventListener('click', () => {
  window.electron.ipcRenderer.send('minimize-window');
});

document.getElementById('maximize-button').addEventListener('click', () => {
  window.electron.ipcRenderer.send('maximize-window');
});

document.getElementById('close-button').addEventListener('click', () => {
  window.electron.ipcRenderer.send('close-window');
});

document.getElementById('Draw')?.addEventListener('click', () => {
  window.electron.ipcRenderer.send('navigate-to', 'front-end/draw.html');
});

document.getElementById('Generate')?.addEventListener('click', () => {
  window.electron.ipcRenderer.send('navigate-to', 'front-end/image_gen.html');
});

document.getElementById('Screen')?.addEventListener('click', () => {
  window.electron.ipcRenderer.send('navigate-to', 'front-end/screen_control.html');
});

document.getElementById('Eink')?.addEventListener('click', () => {
  window.electron.ipcRenderer.send('navigate-to', 'front-end/eink_screens.html');
});
document.getElementById('CharacterSheets')?.addEventListener('click', () => {
  window.electron.ipcRenderer.send('navigate-to', 'front-end/player_character_sheets.html');
});