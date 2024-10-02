let parentFolderCurr = "";
let foldersFolderCurr = "";

let currentImageFolder = "";
let currentImageFile = "";

current_image_path = "";
const display_folder = "/home/jp19050/Github/TTRPG/DnD_Images/copied_to_display";


// Load saved folder on app start START
document.addEventListener('DOMContentLoaded', () => {
  startup();
});

document.getElementById('display')?.addEventListener('click', () => {
  console.log("hello");
  if (current_image_path === "") {
    console.log("Empty path to display");
  } else {
    const fileExtension = current_image_path.split('.').pop().toLowerCase();
    const imageExtensions = ['png', 'jpg', 'jpeg', 'gif', 'bmp', 'webp'];
    const videoExtensions = ['mp4', 'avi', 'mov', 'wmv', 'flv', 'mkv', 'webm', 'm4v', 'mpeg', 'mpg', '3gp', 'ogv'];
    const command = `rm -f ${display_folder}/*`;
    fetch(`/api/sendCommand?path=${encodeURIComponent(command)}`);

    if (imageExtensions.includes(fileExtension)) {
      // Copy single image file
      const fileName = current_image_path.split('/').pop();
      const destination = `${display_folder}/${fileName}`;
      const command = `cp "${current_image_path}" "${destination}"`;
      console.log(command);
      fetch(`/api/sendCommand?path=${encodeURIComponent(command)}`);

      //Toggle 
      const video_toggle = "obs-cli -H localhost -P 4499 item hide video";
      fetch(`/api/sendCommand?path=${encodeURIComponent(video_toggle)}`);
      const image_toggle = "obs-cli -H localhost -P 4499 item show Folder";
      fetch(`/api/sendCommand?path=${encodeURIComponent(image_toggle)}`);

    } else if (videoExtensions.includes(fileExtension)) {
      const update_video = "obs-cli -H localhost -P 4499 input set video local_file '" + current_image_path + "'";
      fetch(`/api/sendCommand?path=${encodeURIComponent(update_video)}`);

      //Toggle 
      const video_toggle = "obs-cli -H localhost -P 4499 item show video";
      fetch(`/api/sendCommand?path=${encodeURIComponent(video_toggle)}`);
      const image_toggle = "obs-cli -H localhost -P 4499 item hide Folder";
      fetch(`/api/sendCommand?path=${encodeURIComponent(image_toggle)}`);
    } else {
      // Assume it's a directory and copy all images
      const command = `find "${current_image_path}" -type f \\( -iname "*.jpg" -o -iname "*.jpeg" -o -iname "*.png" -o -iname "*.gif" -o -iname "*.bmp" -o -iname "*.webp" \\) -exec cp {} "${display_folder}" \\;`;
      console.log(command);
      // Asssume Dir so we toggle off video 
      //Toggle 
      const video_toggle = "obs-cli -H localhost -P 4499 item hide video";
      fetch(`/api/sendCommand?path=${encodeURIComponent(video_toggle)}`);
      const image_toggle = "obs-cli -H localhost -P 4499 item show Folder";
      fetch(`/api/sendCommand?path=${encodeURIComponent(image_toggle)}`);

      fetch(`/api/sendCommand?path=${encodeURIComponent(command)}`);
    }

    const command_show = "obs-cli -H localhost -P 4499 input set Folder loop True";
    fetch(`/api/sendCommand?path=${encodeURIComponent(command_show)}`);
  }
});

async function startup() {
  const savedFolder = '/home/jp19050/Github/TTRPG/TTRPGGadgets/web-app/selectedFolder.txt';
  const response = await fetch(`/api/loadFoldersFromFile?path=${encodeURIComponent(savedFolder)}`);
  const directories = await response.json();
  console.log(directories);
  createButtonsFromText(directories);
}

function createButtonsFromText(dir) {
  //const lines = text.split('\n');
  text = dir["content"]
  const parentFoldersElement = document.getElementById('parentFolders');
  let i = 0;
  console.log(text.length);
  while (i < text.length - 1) {
    const li = document.createElement('li');
    const folderName = text[i];
    if (folderName == "BACKGROUNDS") {
      li.style.backgroundColor = "red";
    }
    li.textContent = dir["names"][i];
    li.addEventListener('click', () => {
      console.log(folderName);
      console.log(li.textContent);
      parentFolderCurr = li.textContent;
      loadDirectories(folderName);
    });
    parentFoldersElement.appendChild(li);
    i++;
  }
}

function displayImages(images, folderPath) {
  const imageContainer = document.getElementById('imageContainer');
  imageContainer.innerHTML = ''; // Clear previous images
  let i = 0;
  images.forEach(image => {
    const imgElement = document.createElement('img');
    imgElement.id = "showingImage";
    imgElement.alt = image;
    currentImageFolder = folderPath;
    currentImageFile = image;
    imgElement.src = `images/${folderPath}/${image}`;
    imgElement.style.width = '20%'; // Adjust image size as needed
    imgElement.style.height = 'auto';
    imageContainer.appendChild(imgElement);
    i++;
  });
}

async function loadDirectories(folderPath) {
  const response = await fetch(`/api/loadFolders?path=${encodeURIComponent(folderPath)}`);
  const parsedResponse = await response.json();
  const directories = parsedResponse["folders"];
  console.log(directories);
  const foldersElement = document.getElementById('folders');
  foldersElement.innerHTML = '';

  directories.forEach(directory => {
    const li = document.createElement('li');
    li.textContent = directory;
    li.addEventListener('click', () => {
      loadFilesAndFolders(folderPath + '/' + directory);
      foldersFolderCurr = directory;
    });
    foldersElement.appendChild(li);
  });

  // Automatically empty files
  const filesElement = document.getElementById('files');
  filesElement.innerHTML = '';

}

async function loadFilesAndFolders(folderPath) {
  const response = await fetch(`/api/loadFolders?path=${encodeURIComponent(folderPath)}`);
  const parsed_response = await response.json();
  const folders = parsed_response["folders"];
  const images_in_folders = parsed_response["images"];
  const response_files = await fetch(`/api/loadFiles?path=${encodeURIComponent(folderPath)}`);
  const files = await response_files.json();
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
          current_image_path = folderPath + "/" + content.name;
          displayImages([content.name], parentFolderCurr + "/" + foldersFolderCurr);
        } else {
          const path_folder = folderPath + "/" + content.name;
          current_image_path = path_folder;
          const images = images_in_folders[content.name]["images"];
          console.log(images);
          //images = files.filter(file => /\.(jpg|jpeg|png|gif)$/.test(file));
          displayImages(images, parentFolderCurr + "/" + foldersFolderCurr + "/" + [content.name]);
        }
      });
      filesElement.appendChild(li);
    }
  });
}

async function applyBattleTrackerOverview() {
  console.log("combat starting...");
  const order = document.getElementById('order_text').textContent;
  const effect = document.getElementById('effects_text').textContent;
  const turn = document.getElementById('turn_text').textContent;

  const url = new URL('/api/battletracker', window.location.origin);
  url.searchParams.append('order', order);
  url.searchParams.append('effect', effect);
  url.searchParams.append('turn', turn);

  await fetch(url);
}

document.getElementById('startCombat')?.addEventListener('click', async (event) => {
  const commands = [
    "obs-cli -H localhost -P 4499 item show Combat_log",
    "obs-cli -H localhost -P 4499 item show Top_banner",
    "obs-cli -H localhost -P 4499 item show Log_banner",
    "obs-cli -H localhost -P 4499 item show order",
    "obs-cli -H localhost -P 4499 item show turn"
  ];

  for (const command of commands) {
    const response = await fetch(`/api/sendCommand?path=${encodeURIComponent(command)}`);
  }
});

document.getElementById('endCombat')?.addEventListener('click', async (event) => {
  const commands = [
    "obs-cli -H localhost -P 4499 item hide Combat_log",
    "obs-cli -H localhost -P 4499 item hide Top_banner",
    "obs-cli -H localhost -P 4499 item hide Log_banner",
    "obs-cli -H localhost -P 4499 item hide order",
    "obs-cli -H localhost -P 4499 item hide turn"
  ];

  for (const command of commands) {
    const response = await fetch(`/api/sendCommand?path=${encodeURIComponent(command)}`);
  }
});

document.getElementById('readCombat')?.addEventListener('click', () => {
  read();
  applyBattleTrackerOverview();
});

document.getElementById('updateCombat')?.addEventListener('click', () => {
  applyBattleTrackerOverview();
});

async function read() {
  const textInput = document.getElementById('combatText').value;
  fetch(`/api/parseCombat?path=${encodeURIComponent(textInput)}`
  )
    .then(response => response.json())
    .then(data => {
      // Update the textarea with the sorted text 
      document.getElementById('combatText').value = data.sortedText;
      document.getElementById('order_text').textContent = "Order:" + data.concatenatedString;
      document.getElementById('debug_text').textContent = "Read complete";

      // Update the dropdown menu with the names list
      const dropdownMenu = document.getElementById('beingHit');
      dropdownMenu.innerHTML = ''; // Clear existing options
      data.namesList.forEach(name => {
        const option = document.createElement('option');
        option.value = name;
        option.textContent = name;
        dropdownMenu.appendChild(option);
      });

      const dropdownMenu2 = document.getElementById('hitting');
      dropdownMenu2.innerHTML = ''; // Clear existing options
      data.namesList.forEach(name => {
        const option = document.createElement('option');
        option.value = name;
        option.textContent = name;
        dropdownMenu2.appendChild(option);
      });

      const dropdownMenu3 = document.getElementById('Effected');
      dropdownMenu3.innerHTML = ''; // Clear existing options
      data.namesList.forEach(name => {
        const option = document.createElement('option');
        option.value = name;
        option.textContent = name;
        dropdownMenu3.appendChild(option);
      });

    })
    .catch(error => {
      console.error('Error:', error);
    });
}

document.getElementById('damage')?.addEventListener('click', async (event) => {
  const textInput = document.getElementById('combatText').value;
  const amount = document.getElementById('amount').value;
  const beingHitSelect = document.getElementById('beingHit');
  let beingHit = beingHitSelect.options[beingHitSelect.selectedIndex].text;
  const hittingSelect = document.getElementById('hitting');
  let hitting = hittingSelect.options[hittingSelect.selectedIndex].text;
  const player_tacker = document.getElementById('player_damage_to_track').value;
  const player_tacker_curr = document.getElementById('player_damage_text').textContent;
  const url = new URL('/api/damage', window.location.origin);
  url.searchParams.append('path', textInput);
  url.searchParams.append('amount', amount);
  url.searchParams.append('beingHit', beingHit);
  url.searchParams.append('hitting', hitting);
  url.searchParams.append('player_tacker', player_tacker);
  url.searchParams.append('player_tacker_curr', player_tacker_curr);
  
  try {
    const response = await fetch(url, {
      method: 'GET',
    });
    const data = await response.json();
    document.getElementById('combatText').value = data.updatedCombatText;
    document.getElementById('player_damage_text').textContent = data.updatedPlayerTrackerCurr;
    
    if (data.callForRead) {
      const store_order = document.getElementById('order_text').textContent;
      const store_effects = document.getElementById('effects_text').textContent;
      await read();
      
      const deathUrl = new URL('/api/death', window.location.origin);
      deathUrl.searchParams.append('store_order', store_order);
      deathUrl.searchParams.append('store_effects', store_effects);
      deathUrl.searchParams.append('updatedCombatText', data.updatedCombatText);
      
      const deathResponse = await fetch(deathUrl);
      const deathData = await deathResponse.json();
      
      console.log(deathData.store_order);
      console.log(deathData.store_effects);
      document.getElementById('order_text').textContent = "Order:" + deathData.store_order;
      document.getElementById('effects_text').textContent = deathData.store_effects;
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    // Call applyBattleTrackerOverview() after all operations are complete
    applyBattleTrackerOverview();
  }
});

document.getElementById('turnCombat')?.addEventListener('click', async () => {
  const textInput = document.getElementById('order_text').textContent;
  const combatText = document.getElementById('combatText').value;
  const turnText = document.getElementById('turn_text').textContent;
  const effects_text = document.getElementById('effects_text').textContent;
  const url = new URL('/api/turn', window.location.origin);
  url.searchParams.append('path', textInput);
  url.searchParams.append('combatText', combatText);
  url.searchParams.append('turnText', turnText);
  url.searchParams.append('effects_text', effects_text);

  try {
    const response = await fetch(url);
    const data = await response.json();
    console.log(data.newOrder);
    document.getElementById('order_text').textContent = data.newOrder;
    document.getElementById('turn_text').textContent = data.newTurn;
    document.getElementById('effects_text').textContent = data.newEffects_text;

    // Call applyBattleTrackerOverview() after the fetch is complete
    applyBattleTrackerOverview();
  } catch (error) {
    console.error('Error:', error);
  }
});

document.getElementById('effect_button')?.addEventListener('click', async (event) => {
  const effect_length = document.getElementById('effect_length').value;
  const effect = document.getElementById('effect').value;
  const effects_text = document.getElementById('effects_text').textContent;
  const thing_effected_table = document.getElementById('Effected');
  const thing_effected = thing_effected_table.options[thing_effected_table.selectedIndex].text;
  const url = new URL('/api/effect', window.location.origin);
  url.searchParams.append('effect', effect);
  url.searchParams.append('effect_length', effect_length);
  url.searchParams.append('effects_text', effects_text);
  url.searchParams.append('thing_effected', thing_effected);

  try {
    const response = await fetch(url);
    const data = await response.json();
    document.getElementById('effects_text').textContent = data.newEffects_text;
    
    // Call applyBattleTrackerOverview() after the fetch is complete
    applyBattleTrackerOverview();
  } catch (error) {
    console.error('Error:', error);
  }

});

document.getElementById('piechart')?.addEventListener('click', async (event) => {
  const player_tacker_curr = document.getElementById('player_damage_text').textContent;

  const url = new URL('/api/piechart', window.location.origin);
  url.searchParams.append('player_tacker_curr', player_tacker_curr);

  fetch(url,
  )
    .then(response => response.json()
    )
    .then(data => {
      console.log(data.pieChartData);
      let command = "python3 piechart_cli.py " + data.pieChartData;
      const response = fetch(`/api/sendCommand?path=${encodeURIComponent(command)}`);

    })
    .catch(error => {
      console.error('Error:', error);
    });
});