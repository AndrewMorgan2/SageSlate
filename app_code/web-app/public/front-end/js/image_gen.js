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
  if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
          const img = document.getElementById('imagePreview');
          img.src = e.target.result;
          img.style.display = 'block';
          
          // Store the image data in the hidden input
          document.getElementById('imageData').value = e.target.result;
      };
      reader.readAsDataURL(file);
  } else {
      document.getElementById('imagePreview').style.display = 'none';
      document.getElementById('imageData').value = '';
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
  saveInputValues();
  try {
    startSpinner();
    const response = await fetch(`/api/generate/core`, {
      method: 'POST',
      headers: {
        'X-API-Key': document.getElementById('apiKey').value,
        'AI-Prompt': document.getElementById('aiPrompt').value,
      }
    });
    const files = await response.json();
    stopSpinner();
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

    uploadedImage.src = files.imagePath; // Assuming the API returns an image path
    uploadedImage.onload = () => {
      spinnerContainer.style.display = 'none';
      uploadedImage.style.display = 'block';
    };
    spinnerContainer.style.display = 'flex'; // Show spinner;

    console.log('File saved successfully:', files);
  } catch (error) {
    stopSpinner();
    console.error('Error:', error);
  }

  document.getElementById('aiPrompt').value = "";
});

document.getElementById('submitTurbo')?.addEventListener('click', async (event) => {
  saveInputValues();
  try {
    startSpinner();
    const response = await fetch(`/api/generate/ultra`, {
      method: 'POST',
      headers: {
        'X-API-Key': document.getElementById('apiKey').value,
        'AI-Prompt': document.getElementById('aiPrompt').value,
      }
    });
    const files = await response.json();
    stopSpinner();
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

    uploadedImage.src = files.imagePath; // Assuming the API returns an image path
    uploadedImage.onload = () => {
      spinnerContainer.style.display = 'none';
      uploadedImage.style.display = 'block';
    };
    spinnerContainer.style.display = 'flex'; // Show spinner;

    console.log('File saved successfully:', files);
  } catch (error) {
    stopSpinner();
    console.error('Error:', error);
  }

  document.getElementById('aiPrompt').value = "";
});

document.getElementById('submitImageImage')?.addEventListener('click', async (e) => {
  saveInputValues(document.getElementById('imageData').value);
  try {
    startSpinner();
    const response = await fetch(`/api/generate/control`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json', // Ensure Content-Type is set to application/json
        'X-API-Key': document.getElementById('apiKey').value,
        'AI-Prompt': document.getElementById('aiPrompt').value,
        //'imageData': document.getElementById('imageData').value,
      },
      body: JSON.stringify({
        imageData: document.getElementById('imageData').value
      }),
    });
    const files = await response.json();
    stopSpinner();
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

    uploadedImage.src = files.imagePath; // Assuming the API returns an image path
    uploadedImage.onload = () => {
      spinnerContainer.style.display = 'none';
      uploadedImage.style.display = 'block';
    };
    spinnerContainer.style.display = 'flex'; // Show spinner;
    document.getElementById('imagePreview').src = "";
    console.log('File saved successfully:', files);
  } catch (error) {
    stopSpinner();
    console.error('Error:', error);
  }

  document.getElementById('aiPrompt').value = "";
});

document.getElementById('submitMoney')?.addEventListener('click', async (event) => {
  try {
    const response = await fetch(`/api/balance`, {
      method: 'GET',
      headers: {
        'X-API-Key': document.getElementById('apiKey').value,
      }
    });
    const credits = await response.json();
    console.log(credits)
    console.log('Money got saved successfully:', credits.credits);
    document.getElementById('credit_text').innerHTML = String(credits.credits);
  } catch (error) {
    console.error('Error:', error);
  }
});

function startSpinner() {
  document.getElementById('spinner').style.display = 'block';
}

function stopSpinner() {
  document.getElementById('spinner').style.display = 'none';
}
