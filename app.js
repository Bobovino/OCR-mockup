const express = require('express')
const multer = require('multer')
const fs = require('fs')
const path = require('path')

// Initialize express app
const app = express()
const port = 3001

// Configure storage for multer
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function(req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))
  }
})

const upload = multer({ storage: storage })

// Endpoint to upload file
app.post('/upload', upload.single('file'), (req, res) => {
  const file = req.file
  if (!file) {
    return res.status(400).send('No file uploaded')
  }
  res.download(file.path, file.originalname, (err) => {
    if (err) {
      console.error(err)
      res.status(500).send('Error sending the file')
    }
    // Optionally, delete the file after sending it to the client
    fs.unlink(file.path, (err) => {
      if (err) console.error('Error deleting the file:', err)
    })
  })
})

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`)
})
