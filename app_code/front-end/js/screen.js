const { path, fs, remote, app, ipcRenderer } = window.electron;

const userData = "/home/jp19050/Github/TTRPG/TTRPGGadgets"
const display_folder= "/home/jp19050/Github/TTRPG/DnD_Images/copied_to_display"
current_image_path = ""

document.getElementById('display')?.addEventListener('click', async () => {
  if (current_image_path === "") {
    console.log("Empty path to display");
  } else {
    const fileExtension = path.extname(current_image_path).toLowerCase();
    const imageExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.bmp', '.webp'];
    const videoExtensions = ['.mp4','.avi','.mov','.wmv','.flv','.mkv','.webm','.m4v','.mpeg','.mpg','.3gp','.ogv'];
    const command = `rm -f ${display_folder}/*`;
    reponse = await window.electron.sendCommand(command);

    if (imageExtensions.includes(fileExtension)) {
      // Copy single image file
      const fileName = path.basename(current_image_path);
      const destination = path.join(display_folder, fileName);
      const command =`cp "${current_image_path}" "${destination}"`;
      console.log(command);
      reponse = await window.electron.sendCommand(command);
      //Toggle 
      const video_toggle="obs-cli -H localhost -P 4499 item hide video";
      reponse = await window.electron.sendCommand(video_toggle);
      const image_toggle="obs-cli -H localhost -P 4499 item show Folder";
      reponse = await window.electron.sendCommand(image_toggle);
    }
    else if (videoExtensions.includes(fileExtension)){
      const update_video="obs-cli -H localhost -P 4499 input set video local_file '" + current_image_path + "'";
      reponse = await window.electron.sendCommand(update_video);

      //Toggle 
      const video_toggle="obs-cli -H localhost -P 4499 item show video";
      reponse = await window.electron.sendCommand(video_toggle);
      const image_toggle="obs-cli -H localhost -P 4499 item hide Folder";
      reponse = await window.electron.sendCommand(image_toggle);
    } else {
      // Assume it's a directory and copy all images
      const command = `find "${current_image_path}" -type f \\( -iname "*.jpg" -o -iname "*.jpeg" -o -iname "*.png" -o -iname "*.gif" -o -iname "*.bmp" -o -iname "*.webp" \\) -exec cp {} "${display_folder}" \\;`;
      console.log(command);
      //Toggle 
      reponse = await window.electron.sendCommand(command);
      const video_toggle="obs-cli -H localhost -P 4499 item hide video";
      reponse = await window.electron.sendCommand(video_toggle);
      const image_toggle="obs-cli -H localhost -P 4499 item show Folder";
      reponse = await window.electron.sendCommand(image_toggle);
    }
    //command_loop = "obs-cli -H localhost -P 4499 input set Folder loop True";
    //reponse = await window.electron.sendCommand(command_loop);
    command_show = "obs-cli -H localhost -P 4499 input set Folder loop True";
    reponse = await window.electron.sendCommand(command_show);
  }
});

document.getElementById('selectFolderButton')?.addEventListener('click', async () => {
  const parentFolderPath = await window.electron.ipcRenderer.invoke('open-folder-dialog');
  if (parentFolderPath) {
    addParentFolder(parentFolderPath); // Add the selected parent folder
    saveSelectedFolder(parentFolderPath);
    loadDirectories(parentFolderPath); // Load subfolders
  }
});

function addParentFolder(parentFolderPath) {
  const parentFoldersElement = document.getElementById('parentFolders');
  const li = document.createElement('li');
  const folderName = parentFolderPath.split('/').pop();
  li.textContent = folderName;
  li.addEventListener('click', () => {
    loadDirectories(parentFolderPath);
  });
  parentFoldersElement.appendChild(li);
}

// Load saved folder on app start START
document.addEventListener('DOMContentLoaded', () => {
  const savedFolder = path.join(userData, 'selectedFolder.txt');
  fs.readFile(savedFolder, 'utf-8', (err, data) => {
    if (!err && data) {
      createButtonsFromText(data);
    }
  });
});

function createButtonsFromText(text) {
  const lines = text.split('\n');
  const parentFoldersElement = document.getElementById('parentFolders');
  lines.forEach((line, index) => {
    if (line.trim()) { // Check if the line is not empty
      const li = document.createElement('li');
      const folderName = line.trim().split('/').pop();
      li.textContent = folderName;
      if (folderName == "BACKGROUNDS") {
        li.style.backgroundColor = "red";
      }
      li.addEventListener('click', () => {
        loadDirectories(line.trim());
    });
    parentFoldersElement.appendChild(li);
    }
  });
}

function addParentFolder(folderName, folderPath) {
  const parentFoldersElement = document.getElementById('parentFolders');
  const li = document.createElement('li');
  li.textContent = folderName;
  li.addEventListener('click', () => {
    loadDirectories(folderPath); // Pass folder path to loadDirectories function
  });
  parentFoldersElement.appendChild(li);
}

function saveSelectedFolder(folderPath) {
  const savedFolder = path.join(userData, 'selectedFolder.txt');
  fs.writeFile(savedFolder, folderPath, (err) => {
    if (err) {
      console.error('Error saving selected folder:', err);
    }
  });
}

function displayImages(images, folderPath) {
  const imageContainer = document.getElementById('imageContainer');
  imageContainer.innerHTML = ''; // Clear previous images
  images.forEach(image => {
    const imgElement = document.createElement('img');
    imgElement.src = `file://${folderPath}/${image}`;
    imgElement.alt = image;
    imgElement.style.width = '20%'; // Adjust image size as needed
    imgElement.style.height = 'auto';
    imageContainer.appendChild(imgElement);
  });
}


async function loadDirectories(folderPath) {
  const directories = await window.electron.ipcRenderer.invoke('get-directories', folderPath);
  const foldersElement = document.getElementById('folders');
  foldersElement.innerHTML = '';

  directories.forEach(directory => {
    const li = document.createElement('li');
    li.textContent = directory;
    li.addEventListener('click', () => {
      loadFilesAndFolders(folderPath + '/' + directory);
    });
    foldersElement.appendChild(li);
  });

  // Automatically empty files
  const filesElement = document.getElementById('files');
  filesElement.innerHTML = '';

}

async function loadFilesAndFolders(folderPath) {
  const folders = await window.electron.ipcRenderer.invoke('get-directories', folderPath);
  const files = await window.electron.ipcRenderer.invoke('get-files', folderPath);
  const contents = [...folders.map(folder => ({ name: folder, type: 'folder', path: (folderPath + '/' + folder) })),
                   ...files.map(file => ({ name: file, type: 'file', path: (folderPath + '/' + file) }))];

  const filesElement = document.getElementById('files');
  filesElement.innerHTML = '';

  const excludedNames = ['copied_to_display', 'off_image', 'eink_images']; // Add the exact names you want to exclude

  contents.forEach(content => {
    if (!content.name.startsWith('.') && !excludedNames.includes(content.name)) {
      const li = document.createElement('li');
      li.textContent = content.name;
      if (content.type === 'file') {
        li.classList.add('file');
      } else {
        li.classList.add('folder');
      }
      li.addEventListener('click', () => {
        if (content.type === 'file') {
          console.log(content.name);
          current_image_path = folderPath + "/" +content.name;
          displayImages([content.name],folderPath);
        } else {
          const path_folder = folderPath + "/"+content.name;
          current_image_path = path_folder;
          const images = fs.readdirSync(path_folder);
          //images = files.filter(file => /\.(jpg|jpeg|png|gif)$/.test(file));
          displayImages(images,path_folder);
        }
      });
      filesElement.appendChild(li);
    }
  });
}

// document.addEventListener('DOMContentLoaded', () => {
//   const savedFolder = ipcRenderer.invoke('load-selected-folder');
//   if (savedFolder) {
//     loadDirectories(savedFolder);
//   }
//   const defaultFolderPath = '/home/jp19050/Github/TTRPG/DnD_Images'; // Set your default folder path here
//   loadDirectories(defaultFolderPath);
// });
