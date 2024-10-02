const express = require('express');
const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');
const FormData = require('form-data');
const app = express();
const port = process.env.PORT || 3000;

const cors = require('cors');
app.use(cors());

app.use(express.json({ limit: '50mb' }));

const aiImagePath = "/home/jp19050/Github/TTRPG/DnD_Images/Multiple_Images/image_gen"

const imagePath = '/home/jp19050/Github/TTRPG/DnD_Images/eink_images/resized';
// Serve the image from an external directory
app.use('/external', express.static(imagePath));

const DnD_ImagesPath = '/home/jp19050/Github/TTRPG/DnD_Images';
// Serve the image from an external directory
app.use('/images', express.static(DnD_ImagesPath));

const TTRPGGadgets_Path = '/home/jp19050/Github/TTRPG/TTRPGGadgets/';
// Serve the image from an external directory
app.use('/ttrpg', express.static(TTRPGGadgets_Path));

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Define routes for each page
app.get('/draw', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'front-end/draw.html'));
});

app.get('/image_gen', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'front-end/image_gen.html'));
});

app.get('/screen_control', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'front-end/screen_control.html'));
});

app.get('/eink_screens', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'front-end/eink_screens.html'));
});

app.get('/combat', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'front-end/combat.html'));
});

app.get('/player_character_sheets', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'front-end/player_character_sheets.html'));
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

//API calls
//Eink
const storeOperations = require('./api/storage_api');

app.get('/api/loadFiles', storeOperations.loadFiles);
app.get('/api/loadFolders', storeOperations.loadFolders);
app.get('/api/loadFoldersFromFile', storeOperations.loadFoldersFromFile);

//General API calls
const generalOperations = require('./api/general');
app.get('/api/SendCommand', generalOperations.sendCommand);

//Imagegen API calls
// Endpoint for checking balance
app.get('/api/balance', async (req, res) => {
  try {
    const apiKey = req.headers['x-api-key'];
    const response = await fetch(`https://api.stability.ai/v1/user/balance`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Non-200 response: ${await response.text()}`);
    }
    const balance = await response.json();
    console.log('Balance:', balance);
    res.json(balance);
  } catch (error) {
    console.error('Error checking balance:', error);
    res.status(500).json({ error: 'Error checking balance' });
  }
});

// Endpoint for core image generation
app.post('/api/generate/core', async (req, res) => {
  try {
    const prompt = req.headers['ai-prompt'];
    const apiKey = req.headers['x-api-key'];

    const payload = {
      prompt: prompt,
      output_format: "png"
    };
    const response = await axios.postForm(
      `https://api.stability.ai/v2beta/stable-image/generate/core`,
      axios.toFormData(payload, new FormData()),
      {
        validateStatus: undefined,
        responseType: "arraybuffer",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          Accept: "image/*"
        },
      },
    );
    if (response.status === 200) {
      let first30Chars = prompt.substring(0, 60);
      const dirPath = path.join(aiImagePath, first30Chars);
      await fs.mkdir(dirPath, { recursive: true });
      const filePath = path.join(dirPath, '1.png');
      await fs.writeFile(filePath, Buffer.from(response.data));
      res.json({ imagePath: `/home/jp19050/Github/TTRPG/DnD_Images/Multiple_Images/image_gen/${first30Chars}/1.png` });
    } else {
      throw new Error(`${response.status}: ${response.data}`);
    }
  } catch (error) {
    console.error('Request error:', error);
    res.status(500).json({ error: 'Error generating image' });
  }
});

// Endpoint for ultra image generation
app.post('/api/generate/ultra', async (req, res) => {
  try {
    const prompt = req.headers['ai-prompt'];
    const apiKey = req.headers['x-api-key'];

    const payload = {
      prompt: prompt,
      output_format: "png"
    };
    const response = await axios.postForm(
      `https://api.stability.ai/v2beta/stable-image/generate/ultra`,
      axios.toFormData(payload, new FormData()),
      {
        validateStatus: undefined,
        responseType: "arraybuffer",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          Accept: "image/*"
        },
      },
    );
    if (response.status === 200) {
      let first30Chars = prompt.substring(0, 60);
      const dirPath = path.join(aiImagePath, first30Chars);
      await fs.mkdir(dirPath, { recursive: true });
      const filePath = path.join(dirPath, '1.png');
      await fs.writeFile(filePath, Buffer.from(response.data));
      res.json({ imagePath: `/home/jp19050/Github/TTRPG/DnD_Images/Multiple_Images/image_gen/${first30Chars}/1.png` });
    } else {
      throw new Error(`${response.status}: ${response.data}`);
    }
  } catch (error) {
    console.error('Request error:', error);
    res.status(500).json({ error: 'Error generating image' });
  }
});

// Endpoint for control image generation
app.post('/api/generate/control', async (req, res) => {
  try {
    const prompt = req.headers['ai-prompt'];
    const apiKey = req.headers['x-api-key'];
    const imageData = req.body.imageData; // Extract imageData from the request body

    // Decode base64 image data
    const base64Data = imageData.replace(/^data:image\/\w+;base64,/, "");
    const imageBuffer = Buffer.from(base64Data, 'base64');

    const form = new FormData();
    form.append('prompt', prompt);
    form.append('output_format', "png");
    form.append('image', imageBuffer, { filename: 'image.png' }); // Ensure image is added correctly

    const response = await axios.post(
      `https://api.stability.ai/v2beta/stable-image/control/sketch`,
      form,
      {
        validateStatus: undefined,
        responseType: "arraybuffer",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          Accept: "image/*",
          ...form.getHeaders(),
        },
      },
    );
    if (response.status === 200) {
      let first30Chars = prompt.substring(0, 60);
      const dirPath = path.join(aiImagePath, first30Chars);
      await fs.mkdir(dirPath, { recursive: true });
      const filePath = path.join(dirPath, '1.png');
      await fs.writeFile(filePath, Buffer.from(response.data));
      res.json({ imagePath: `/home/jp19050/Github/TTRPG/DnD_Images/Multiple_Images/image_gen/${first30Chars}/1.png` });
    } else {
      throw new Error(`${response.status}: ${response.data}`);
    }
  } catch (error) {
    console.error('Request error:', error);
    res.status(500).json({ error: 'Error generating image' });
  }
});

app.get('/api/parseCombat', async (req, res) => {
  try {
    const prompt = req.query.path;
    const lines = prompt.split('\n').filter(line => line.trim() !== ''); // Split text into lines

    // Create an array of arrays, each containing words of a line
    let linesArray = lines.map(line => line.split(/\s+/));

    // Sort the linesArray based on the first word of each line (assuming it's a number)
    linesArray.sort((a, b) => {
      const numA = parseFloat(a[0]);
      const numB = parseFloat(b[0]);
      return numB - numA; // Reverse the order by switching numA and numB
    });

    // Convert the sorted array of arrays back into a single string
    const sortedText = linesArray.map(lineArray => lineArray.join(' ')).join('\n');

    // Loop through the sorted lines and concatenate the second element of each row into a string
    let concatenatedString = '';
    let namesList = [];
    linesArray.forEach(lineArray => {
      if (lineArray.length > 1) {
        concatenatedString += lineArray[1] + ', ';
        namesList.push(lineArray[1]);
      }
    });

    // Trim the trailing space from the concatenated string
    concatenatedString = concatenatedString.trim();

    // Respond with the sorted text, concatenated string, and names list as JSON
    res.json({
      sortedText: sortedText,
      concatenatedString: concatenatedString,
      namesList: namesList
    });

  } catch (error) {

  }
});

app.get('/api/damage', async (req, res) => {
  let callForRead = false;
  try {
    const { path, amount, beingHit, hitting, player_tacker, player_tacker_curr } = req.query;
    console.log('Received in API:', { path, amount, beingHit, hitting, player_tacker, player_tacker_curr });

    // Split text into lines and parse them into arrays
    let lines = path.split('\n').map(line => line.trim().split(/\s+/));

    // Find the line that corresponds to the person being hit
    let beingHitLineIndex = lines.findIndex(line => line.length > 1 && line[1] === beingHit);
    if (beingHitLineIndex === -1) {
      throw new Error(`Person '${beingHit}' not found in combat text.`);
    }

    // Reduce the third element (assumed to be health or damage taken)
    let currentHealth = parseInt(lines[beingHitLineIndex][2]);
    let damageDealt = Math.min(parseInt(amount), currentHealth);
    lines[beingHitLineIndex][2] = (currentHealth - damageDealt).toString();
    if (damageDealt != amount) {
      lines.splice(beingHitLineIndex, 1);
      //call for a read 
      callForRead = true;
    }

    // Construct updated combat text
    let updatedCombatText = lines.map(line => line.join(' ')).join('\n');

    // Handle player damage tracking
    let updatedPlayerTrackerCurr = player_tacker_curr || '';
    if (player_tacker.includes(hitting)) {
      // Parse the current player tracker string
      let trackerEntries = updatedPlayerTrackerCurr.split(',').map(entry => {
        let [name, damage] = entry.split(':');
        return { name: name.trim(), damage: parseInt(damage) || 0 };
      });

      // Find the entry for the hitting player
      let playerEntry = trackerEntries.find(entry => entry.name === hitting);
      if (playerEntry) {
        playerEntry.damage += damageDealt;
      } else {
        // If not found, add a new entry
        trackerEntries.push({ name: hitting, damage: damageDealt });
      }

      // Reconstruct the updated player tracker string
      updatedPlayerTrackerCurr = trackerEntries
        .map(entry => `${entry.name}:${entry.damage}`)
        .join(', ');
    }

    // Prepare response
    const response = {
      updatedCombatText,
      hitting,
      damageDealt,
      updatedPlayerTrackerCurr,
      callForRead,
    };

    // Send response
    res.status(200).json(response);
  } catch (error) {
    console.error('Error in /api/damage endpoint:', error.message);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/api/turn', async (req, res) => {
  const { path, combatText, turnText, effects_text } = req.query;
  let lines = combatText.split('\n').map(line => line.trim().split(/\s+/));
  // Remove "Order:" and split the remaining text into an array
  const names = path.replace(/^Order:\s*/, '').split(' ');
  // Rotate the array so that the first name becomes last
  const rotatedNames = [...names.slice(1), names[0]];

  let newTurn = turnText;

  // Check if we increment turns
  if (rotatedNames[0] === lines[0][1]) {
    // Extract the turn number and increment it
    const turnMatch = turnText.match(/Turn:(\d+)/);
    if (turnMatch) {
      const currentTurn = parseInt(turnMatch[1]);
      newTurn = `Turn:${currentTurn + 1}`;
    }
  }
  // Join the names back into a string
  const newOrder = "Order:" + rotatedNames.join(' ');
  console.log('New order:', newOrder);

  // Process effects
  let effectLines = effects_text.split('\n');
  if (effectLines[0].trim().toLowerCase() === 'effects:') {
    effectLines = effectLines.slice(1);
  }

  let updatedEffects = effectLines.map(line => {
    if (line.trim() === '') return null;
    let [thing, effect, length] = line.split('->').map(item => item.trim());
    if (rotatedNames[0] === thing) {
      let newLength = parseInt(length) - 1;
      if (newLength <= 0) return null;
      return `${thing} -> ${effect} -> ${newLength}`;
    }
    return line;
  }).filter(line => line !== null);

  let newEffects_text = 'Effects:\n' + updatedEffects.join('\n');
  if (updatedEffects.length === 0) {
    newEffects_text = 'Effects:';
  }

  res.json({
    newOrder: newOrder,
    newTurn: newTurn,
    newEffects_text: newEffects_text
  });
});

app.get('/api/effect', async (req, res) => {
  const { effect, effect_length, effects_text, thing_effected } = req.query;

  // Split the effects_text into lines
  let effectLines = effects_text.split('\n');

  // Remove the "Effects:" header if it exists
  if (effectLines[0].trim().toLowerCase() === 'effects:') {
    effectLines = effectLines.slice(1);
  }

  // Process existing effects and add new effect
  let updatedEffects = effectLines.filter(line => line.trim() !== '');

  // Add new effect if provided
  if (effect && effect_length && thing_effected) {
    updatedEffects.push(`${thing_effected} -> ${effect} -> ${effect_length};`);
  }

  // Construct the new effects text
  let newEffects_text = 'Effects:\n' + updatedEffects.join('\n');

  // If there are no effects, just return "Effects:"
  if (updatedEffects.length === 0) {
    newEffects_text = 'Effects:';
  }

  console.log('Updated effects:', newEffects_text);

  res.json({
    newEffects_text: newEffects_text,
  });
});

app.get('/api/piechart', async (req, res) => {
  try {
    const { player_tacker_curr } = req.query;

    // Split the input into lines
    const lines = player_tacker_curr.split('\n');

    // Process the data, skipping the first line
    const processedData = lines
      .flatMap(line => line.split(',')) // Split each line by comma
      .map(pair => {
        const [name, damage] = pair.split(':');
        return `"${damage.trim()}" "${name.trim()}" `;
      })
      .join(' ');

    res.json({
      pieChartData: processedData,
    });
  } catch {
    console.log("piechart failed");
  }
});

app.get('/api/death', async (req, res) => {
  const { store_order, store_effects, updatedCombatText } = req.query;

  // Process updatedCombatText
  const lines = updatedCombatText.split('\n');
  const namesInCombatText = lines.map(line => {
    const words = line.trim().split(' ');
    return words.length > 1 ? words[1] : '';
  }).filter(name => name !== '');

  // Process store_order
  let filteredStoreOrder = [];
  if (store_order) {
    const orderNames = store_order.replace('**Order:', '').replace('**', '').split(',');
    filteredStoreOrder = orderNames.map(name => name.trim()).filter(name => namesInCombatText.includes(name));
  }

  // Process store_effects
  let filteredStoreEffects = [];
  if (store_effects) {
    const effectsEntries = store_effects.replace('**Effects:', '').replace('**', '').split(';');
    filteredStoreEffects = effectsEntries.filter(entry => {
      const parts = entry.trim().split('->');
      if (parts.length >= 1) {
        const name = parts[0].trim();
        return namesInCombatText.includes(name);
      }
      return false;
    });
  }

  // Respond with the filtered arrays
  res.json({
    store_order: filteredStoreOrder.join(','),
    store_effects: filteredStoreEffects.join(';')
  });
});

// Helper function to filter an array based on names present in namesInCombatText
function filterByNames(arrayToFilter, namesInCombatText) {
  if (!arrayToFilter || !Array.isArray(arrayToFilter)) {
    return [];
  }
  return arrayToFilter.filter(item => namesInCombatText.includes(item));
}

function shortenOrder(order, maxLength) {
  const names = order.split(',');
  let result = '';
  let currentLength = 0;

  for (let i = 0; i < names.length; i++) {
    const name = names[i].trim();

    // Check if adding this name (plus a comma) would exceed the max length
    if (currentLength + name.length + (currentLength > 0 ? 1 : 0) > maxLength) {
      break;
    }

    // Add comma if it's not the first name
    if (currentLength > 0) {
      result += ',';
      currentLength += 1;
    }

    // Add the name
    result += name;
    currentLength += name.length;
  }

  return result;
}

// Example usage:
const order = "Alice,Bob,Charlie,David,Eve,Frank";
console.log(shortenOrder(order, 20));  // Output: "Alice,Bob,Charlie"
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

app.get('/api/battletracker', async (req, res) => {
  let { order, turn, effect } = req.query;
  const show_order = shortenOrder(order, 32); //32 ARB

  // Remove "Order:" prefix from order
  order = order.replace(/^Order:/, '').trim();

  // Remove "Effect:" prefix from effect
  effect = effect.replace(/^Effects:/, '').trim();

  //Legacy from when I used to use fbi and generate images for combat with custom overlays
  //let command = `python3 battletracker.py /home/jp19050/Github/TTRPG/DnD_Images/${newPath} ./output_image.jpg ./images/banner.png ./images/banner_half.png '${show_order}' '${effect}' ${turn} && echo zeebri | sudo -S fbi -d /dev/fb0 -T 1 -noverbose -a ./output_image.jpg`;

  const path_log = TTRPGGadgets_Path + "../ScreenControll/obs_text_files/Order.txt";
  const path_effect = TTRPGGadgets_Path + "../ScreenControll/obs_text_files/Log.txt";
  const path_turn = TTRPGGadgets_Path + "../ScreenControll/obs_text_files/Turn.txt";

  console.log(show_order);
  console.log(effect);
  console.log(turn);

  // Function to promisify fs.writeFile
  const writeFilePromise = (path, data) => {
    return new Promise((resolve, reject) => {
      fs.writeFile(path, data, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  };

  try {
    await writeFilePromise(path_log, show_order);
    console.log("Successfully wrote to text files");
    res.status(200).send("Battle tracker updated successfully");
  } catch (error) {
    console.error("Error writing to text files:", error);
    res.status(500).send("Error updating battle tracker");
  }

  try {
    await writeFilePromise(path_log, show_order);
    console.log("Successfully wrote to text files");
    res.status(200).send("Battle tracker updated successfully");
  } catch (error) {
    console.error("Error writing to text files:", error);
    res.status(500).send("Error updating battle tracker");
  }

  try {
    await writeFilePromise(path_effect, effect);
    console.log("Successfully wrote to text files");
    res.status(200).send("Battle tracker updated successfully");
  } catch (error) {
    console.error("Error writing to text files:", error);
    res.status(500).send("Error updating battle tracker");
  }

});

// Catch-all route for any unmatched routes (optional) MUST BE AT THE END
app.get('*', (req, res) => {
  res.status(404).sendFile(path.join(__dirname, 'public', 'front-end/draw.html'));
});