// Function to save form values
function saveFormValues() {
    const forms = document.getElementsByClassName('playerCardForm');
    
    for (let form of forms) {
      const formData = new FormData(form);
      const formId = form.id;
      
      for (const [key, value] of formData.entries()) {
        localStorage.setItem(`${formId}_${key}`, value);
      }
    }
  }
  
  function loadFormValues() {
    const forms = document.getElementsByClassName('playerCardForm');
    
    for (let form of forms) {
      const formId = form.id;
      
      for (const element of form.elements) {
        if (element.name) {
          const savedValue = localStorage.getItem(`${formId}_${element.name}`);
          if (savedValue) {
            element.value = savedValue;
          }
        }
      }
    }
  }
  function getPlayerValues(tag) {
    const player = document.getElementById(tag);
    const inputs = player.querySelectorAll('input, select');
    const values = {};

    inputs.forEach(input => {
        values[input.id] = input.value;
    });

    return values;
}
  // Function to generate command and display image
  async function generateCommand(playerNum) {
    //python3 player_card_gen.py ./template.png ./output.jpg ./arial.ttf 24 Thorin Dwarf 150 "+3 +2" "+2 +1" "+4 +2" "+1 +0" "+2 +1" "+0 -1" 25 +3 +2 +5 "1d8+3" +4 "1d6+1" +2 30 45 30 45
    
    const orderedKeys = [
        "template", "name", "race", "age", 
       "str", "dex", "con", "int", 
        "wis", "cha", "speed", "level", "Special1",
        "mainAtt", "mainDmg", "Special2", "magic_atk", "ac",
        "hpMax", "maxMana", "hp", "mana", "save", "prof_bonus"
    ];
    // Your existing command generation code here
    const playerData = getPlayerValues(playerNum);
    let resultString = 'cd /home/jp19050/Github/TTRPG/TTRPGGadgets && python3 ';
    if(playerData["template"] == "./bardbarain.png" || playerData["template"] == "./fighter.png" || playerData["template"] == "./monk.png" || playerData["template"] == "./rogue.png")
      resultString += './none_magic.py ';
    else{
      resultString += './magic.py ';
    }
    resultString += './Bungee-Regular.ttf 20';
    resultString += ` ./${playerNum}.png`;

    orderedKeys.forEach(key => {
        if (playerData[key]) {
            resultString += ` "${playerData[key]}" `;
        } else {
          resultString += ` " " `;
        }
    });

    resultString.trim();  // Remove trailing space
    let commandDisplay = playerNum + 'commandDisplay';
    document.getElementById(commandDisplay).textContent = resultString;
    console.log(playerData);
    // Save form values
    saveFormValues();


    //run command
    const payload = resultString;
    const response = await fetch(`/api/sendCommand?path=${encodeURIComponent(payload)}`);

    // Generate and display image (placeholder for now)
    updateImage(playerData, playerNum);
  }

  // Generate and display image
    function updateImage(playerData, playerNum) {
        const timestamp = new Date().getTime(); // Get current timestamp
        const imageUrl = `ttrpg/${playerNum}.png?t=${timestamp}`;
        console.log(imageUrl);
        let generatedImage = playerNum + 'generatedImage';
        document.getElementById(generatedImage).src = imageUrl;
    }
  
  // Load saved values when the page loads
  window.addEventListener('load', loadFormValues);
  
  // Add event listener to form inputs
  const forms = document.getElementsByClassName('playerCardForm');
    
  for (let form of forms) {
    form.addEventListener('input', saveFormValues);
  }

  function toggleCollapse(entryId) {
    const content = document.querySelector(`#${entryId} .entry-content`);
    content.style.display = content.style.display === 'none' ? 'block' : 'none';
}   

function collapseEntry(entryId) {
    const content = document.querySelector(`#${entryId} .entry-content`);
    const button = document.querySelector(`#${entryId} .collapse-btn`);
    content.style.display = 'none';
    button.textContent = 'Expand';
}

const playerCount = 4;

function initializePlayers() {
    for (let i = 1; i <= playerCount; i++) {
        const entryId = `player${i}`;
        const entry = document.getElementById(entryId);
        const form = createPlayerForm(entryId);

        entry.querySelector('.entry-content').appendChild(form);
        entry.querySelector('.collapse-btn').addEventListener('click', () => toggleCollapse(entryId));
        form.addEventListener('input', (e) => saveFormValues(e.target.form));

        loadFormValues(entryId);

        // Collapse the entry by default
        collapseEntry(entryId);
    }
}

function createPlayerForm(entryId) {
    const form = document.createElement('form');
    form.id = `${entryId}Form`;
    form.className = 'playerCardForm';

    // Add your form fields here
    form.innerHTML = `

    `;

    return form;
}

async function display(playerNum){
    let command = "cd /home/jp19050/Github/TTRPG/TTRPGGadgets && echo zeebri | sudo -S python3 web-app/eink_screen_upload_pi.py " // output.jpg 1
    const playerData = getPlayerValues(playerNum);
    //console.log(playerData);
    command += "./" + playerNum + ".png " + playerData["eink_selector"] + " & read; exec bash";
    console.log(command);
    let progressUpload = playerNum + 'progessUpload';
    document.getElementById(progressUpload).textContent = "sending...";
    const response = await fetch(`/api/sendCommand?path=${encodeURIComponent(command)}`);

    document.getElementById(progressUpload).textContent = result;
}
function copyToClipboard() {
  const textToCopy = "▊";
  
  // Create a temporary textarea element
  const tempTextArea = document.createElement("textarea");
  tempTextArea.value = textToCopy;
  
  // Append it to the body
  document.body.appendChild(tempTextArea);
  
  // Select the text
  tempTextArea.select();
  tempTextArea.setSelectionRange(0, 99999); // For mobile devices
  
  // Copy the text
  document.execCommand("copy");
  
  // Remove the temporary element
  document.body.removeChild(tempTextArea);
  
  console.log("Copied to clipboard: " + textToCopy);
}

async function BTconnectScreen(screen) {
  mac_adds = ["0C:B8:15:E0:E4:C2", "C8:F0:9E:B4:1C:CE", "0C:B8:15:E2:4B:62","0C:B8:15:D9:B8:AE", "94:B5:55:1A:FF:96"]
  const terminalCommand = `echo zeebri | sudo -S rfcomm connect /dev/rfcomm${screen} ${mac_adds[screen]} 1 & read; exec bash`; // For GNOME Terminal
  //command = "sudo rfcomm connect /dev/rfcomm" + screen + "0 C8:F0:9E:B4:1C:CE 1 &";
  const response = await fetch(`/api/sendCommand?path=${encodeURIComponent(terminalCommand)}`);

  console.log(result);
}

// Initialize players when the page loads
window.addEventListener('load', initializePlayers);