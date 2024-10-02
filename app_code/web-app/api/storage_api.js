const fs = require('fs').promises;
const path = require('path');

async function loadFiles(req, res) {
  try {
    const folderPath = req.query.path; // Get the path from the query parameter
    const files = await fs.readdir(folderPath);
    res.json(files);
  } catch (error) {
    console.error('Error reading directory:', error);
    res.status(500).json({ error: 'Error reading directory' });
  }
}

async function loadFolders(req, res) {
  try {
    const folderPath = req.query.path; // Get the path from the query parameter
    const items = await fs.readdir(folderPath, { withFileTypes: true });
    const folders = items.filter(item => item.isDirectory()).map(item => item.name);
    const dictionary = {};

    for (const folder of folders) {
      const fullPath = path.join(folderPath, folder);
      const stats = await fs.stat(fullPath);
      const images = await fs.readdir(fullPath);

      dictionary[folder] = {
        isDirectory: true,
        size: stats.size,
        modifiedTime: stats.mtime,
        images: images
      };
    }
    
    res.json({folders: folders, images: dictionary});
  } catch (error) {
    console.error('Error reading directory:', error);
    res.status(500).json({ error: 'Error reading directory' });
  }
}

async function loadFoldersFromFile(req, res) {
  try {
    const filePath = req.query.path;
    const data = await fs.readFile(filePath, 'utf-8');
    const lines = data.split('\n');

    folderNames = []
    lines.forEach(line => {
      const folderName = line.trim().split('/').pop();
      folderNames.push(folderName);
    });

    res.json({ content: lines, names: folderNames});
  } catch (error) {
    console.error('Error reading file:', error);
    res.status(500).json({ error: 'Error reading file' });
  }
}

module.exports = {
  loadFiles,
  loadFolders,
  loadFoldersFromFile
};