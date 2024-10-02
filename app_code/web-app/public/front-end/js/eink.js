async function loadFiles(folderPath) {
  try {
    const response = await fetch(`/api/loadFiles?path=${encodeURIComponent(folderPath)}`);
    const files = await response.json();
    console.log(files);
    const contents = [...files.map(file => ({ name: file, type: 'file', path: (folderPath + '/' + file) }))];

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
            document.getElementById('selected_image_path').textContent = document.getElementById('credit_text').textContent + "/" + content.name;
            document.getElementById('imagePreview').src = "external/" + content.name;
            //displayImages([content.name],folderPath);
          } else {
            console.error("exspected a file and recived a folder in eink screens...");
            // const path_folder = folderPath + "/" + content.name;
            // const images = fs.readdirSync(path_folder);
            //images = files.filter(file => /\.(jpg|jpeg|png|gif)$/.test(file));
            // displayImages(images,path_folder);
          }
        });
        filesElement.appendChild(li);
      }
    });
  } catch (error) {
    console.error('Error loading directories:', error);
  }
}

window.addEventListener('DOMContentLoaded', () => {
  //document.getElementById('folderSelector').files[0]
  loadFiles("/home/jp19050/Github/TTRPG/DnD_Images/eink_images/resized");
});

async function display() {
  if (document.getElementById('selected_image_path').textContent == "Nothing Selected") {
    document.getElementById('upload_status').textContent = "Select then upload";
    return;
  }
  if (document.getElementById('eink_selector').value == "Select a eink") {
    document.getElementById('upload_status').textContent = "Select an eink screen aswell";
  }

  let command = "echo zeebri | sudo -S python3 ./eink_screen_upload_pi.py ";
  command += document.getElementById('selected_image_path').textContent + " " + document.getElementById('eink_selector').value + " & read; exec bash";
  document.getElementById('upload_status').textContent = "sending...";
  console.log(command);
  try {
    const response = await fetch(`/api/sendCommand?path=${encodeURIComponent(command)}`);
    const result = await response.json();
    document.getElementById('upload_status').textContent = result;
  } catch (error) {
    console.error('Error loading directories:', error);
  }
}

document.addEventListener('DOMContentLoaded', function () {
  const imageSelector = document.getElementById('imageSelector');
  imageSelector.addEventListener('change', handleFileSelect);
});

function isImageFile(file) {
  const acceptedImageTypes = ['image/gif', 'image/jpeg', 'image/png', 'image/bmp', 'image/webp'];
  return file && acceptedImageTypes.includes(file.type);
}

async function handleFileSelect(event) {
  const file = event.target.files[0];
  console.log(event);
  if (file) {
      if (isImageFile(file)) {
          const filePath = file;
          const fileName = file.name;
          runCommandWithFile(filePath, fileName);
      } else {
          console.error("Selected file is not an image");
          // Optionally, show an error message to the user
      }
  }
}

async function runCommandWithFile(filePath, fileName) {
  const outputPath = document.getElementById('credit_text').textContent + "/" + fileName;
  const command = `convert "${filePath}" -resize 400x300! -colorspace Gray "${outputPath}"`;
  console.log("Running command:", command);

  try {
    const response = await fetch(`/api/sendCommand?path=${encodeURIComponent(command)}`);
    const result = await response.json();
  } catch (error) {
    console.error('Error loading directories:', error);
  }
}