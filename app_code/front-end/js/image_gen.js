document.getElementById('submit')?.addEventListener('click', () => {
    const apiKey = document.getElementById('apiKey').value;
    const aiPrompt = document.getElementById('aiPrompt').value;
    const aiNegativePrompt = document.getElementById('aiNegativePrompt').value;
    const imageSelector = document.getElementById('imageSelector').files[0];
  
    console.log(`API Key: ${apiKey}`);
    console.log(`AI Prompt: ${aiPrompt}`);
    console.log(`AI Negative Prompt: ${aiNegativePrompt}`);
    console.log(`Selected Image: ${imageSelector ? imageSelector.name : 'No image selected'}`);
});

document.getElementById('imageSelector')?.addEventListener('change', (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();
  
    reader.onload = (e) => {
      const img = document.getElementById('imagePreview');
      img.src = e.target.result;
      img.style.display = 'block';
    };
  
    if (file) {
      reader.readAsDataURL(file);
    } else {
      document.getElementById('imagePreview').style.display = 'none';
    }
  
    saveInputValues();
  });

document.getElementById('apiKey')?.addEventListener('input', (event) => {
  saveInputValues();
});
document.getElementById('aiPrompt')?.addEventListener('input', (event) => {
  saveInputValues();
});
document.getElementById('aiNegativePrompt')?.addEventListener('input', (event) => {
  saveInputValues();
});
  
function saveInputValues() {
    //console.log("print(saving...)");
    const apiKey = document.getElementById('apiKey')?.value;
    const aiPrompt = document.getElementById('aiPrompt')?.value;
    const aiNegativePrompt = document.getElementById('aiNegativePrompt')?.value;
    const imageSelector = document.getElementById('imageSelector')?.files[0];
  
    localStorage.setItem('apiKey', apiKey || '');
    localStorage.setItem('aiPrompt', aiPrompt || '');
    localStorage.setItem('aiNegativePrompt', aiNegativePrompt || '');
    if (imageSelector) {
      localStorage.setItem('imageSelector', imageSelector.name);
    }
  }
  
  function loadInputValues() {
    const apiKey = localStorage.getItem('apiKey');
    const aiPrompt = localStorage.getItem('aiPrompt');
    const aiNegativePrompt = localStorage.getItem('aiNegativePrompt');
    const imageSelector = localStorage.getItem('imageSelector');
  
    if (apiKey) document.getElementById('apiKey').value = apiKey;
    if (aiPrompt) document.getElementById('aiPrompt').value = aiPrompt;
    if (aiNegativePrompt) document.getElementById('aiNegativePrompt').value = aiNegativePrompt;
    if (imageSelector) document.getElementById('imageSelector').value = imageSelector;
  }
  
  document.addEventListener('DOMContentLoaded', loadInputValues);

  //Buttons
  document.getElementById('submitTextImage')?.addEventListener('click', async (event) => {
    console.log(String(document.getElementById('apiKey').value));
    const payload = {
      prompt: String(document.getElementById('aiPrompt').value),
      output_format: "png",
      aspect_ratio: "16:9",
      apiKey: String(document.getElementById('apiKey').value),
    };

    document.getElementById('aiPrompt').value = "";
    saveInputValues();
    addImageItem(payload, 'send-request');
    try {
      const response = await window.electron.sendRequest(payload)
      console.log('File saved successfully:', response);
    } catch (error) {
      console.error('Error:', error);
    }
  });

  document.getElementById('submitTurbo')?.addEventListener('click', async (event) => {

    const payload = {
      prompt: String(document.getElementById('aiPrompt').value),
      output_format: "png",
      apiKey: document.getElementById('apiKey').value,
    };

    document.getElementById('aiPrompt').value = "";
    saveInputValues();

    try {
      const response = await window.electron.sendRequestUltra(payload);
      console.log('File saved successfully:', response);
    } catch (error) {
      console.error('Error:', error);
    }
  });

  document.getElementById('submitImageImage')?.addEventListener('click', async (event) => {
    //console.log(String(document.getElementById('aiPrompt').value));
    //console.log(document.getElementById('imageSelector').files[0].path);

    const payload = {
      image: "/home/jp19050/Downloads/image.png",//String(document.getElementById('imageSelector').files[0].path),
      //image: window.electron.fs.createReadStream(String(document.getElementById('imageSelector').files[0].path)),
      prompt: String(document.getElementById('aiPrompt').value),
      output_format: "png",
      apiKey: document.getElementById('apiKey').value,
    };

    document.getElementById('aiPrompt').value = "";
    saveInputValues();

    try {
      console.log(payload);
      const response = await window.electron.sendRequestControl(payload);
      console.log('File saved successfully:', response);
    } catch (error) {
      console.error('Error:', error);
    }
  });

  document.getElementById('submitMoney')?.addEventListener('click', async (event) => {
    const payload = {
      apiKey: document.getElementById('apiKey').value,
    };

    try {
      const response = await window.electron.sendRequestMoney(payload);
      console.log('Money got saved successfully:', response.credits);
      document.getElementById('credit_text').innerHTML = String(response.credits);
    } catch (error) {
      console.error('Error:', error);
    }
  });

  window.electron.ipcRenderer.on('start-spinner', () => {
    document.getElementById('spinner').style.display = 'block';
  });

  window.electron.ipcRenderer.on('stop-spinner', () => {
    document.getElementById('spinner').style.display = 'none';
  });

  function addImageItem(payload, calling) {
    const imageList = document.getElementById('imageList');
    const imageItem = document.createElement('div');
    imageItem.className = 'image-item';

    const spinnerContainer = document.createElement('div');
    spinnerContainer.className = 'spinner-container';

    const spinner = document.createElement('div');
    spinner.className = 'spinner';

    const uploadedImage = document.createElement('img');
    uploadedImage.className = 'uploaded-image';

    imageItem.appendChild(spinner);
    imageItem.appendChild(spinnerContainer);
    imageItem.appendChild(uploadedImage);
    imageList.insertBefore(imageItem, imageList.firstChild);

    window.electron.ipcRenderer.invoke(calling, payload)
      .then(result => {
        uploadedImage.src = result;
          uploadedImage.onload = () => {
            spinnerContainer.style.display = 'none';
            uploadedImage.style.display = 'block';
          };
      })
      .catch(error => {
        console.error(error);
        spinner.style.display = 'none'; // Hide spinner on error
      });

      spinnerContainer.style.display = 'flex'; // Show spinner
  }