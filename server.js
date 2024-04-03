const express = require('express');
const multer = require('multer');
const cors = require('cors');
const app = express();
const port = 3001;

// Enable CORS
app.use(cors());

// Setup multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage: storage }).array('files');

// Route for file upload
app.post('/upload', upload, (req, res) => {
  // Check if a file is received
  if (!req.file) {
    return res.status(400).send('No file uploaded.');
  }

  // Set headers to inform the browser about the downloadable file
  res.set({
    'Content-Type': req.file.mimetype,
    'Content-Disposition': `attachment; filename="${req.file.originalname}"`,
  });

  // Send the file data back to the client
  res.send(req.file.buffer);
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
