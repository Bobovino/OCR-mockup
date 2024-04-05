const express = require('express');
const multer = require('multer');
const cors = require('cors');
const app = express();
const port = 3001;

// Enable CORS - important for local testing where client and server have different origins
app.use(cors());

// Set up multer with memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.post('/upload', upload.array('files'), (req, res) => {
    // Check if files are received
    if (!req.files || req.files.length === 0) {
        return res.status(400).send('No files uploaded.');
    }

    // Prepare multipart response (requires 'content-type': 'multipart/form-data')
    const boundary = "BoundaryString";
    res.setHeader('Content-Type', `multipart/form-data; boundary=${boundary}`);
    
    let multipartBody = '';

    req.files.forEach(file => {
        multipartBody += 
            `--${boundary}\r\n` +
            `Content-Disposition: form-data; name="${file.fieldname}"; filename="${file.originalname}"\r\n` +
            `Content-Type: ${file.mimetype}\r\n\r\n` +
            file.buffer.toString('binary') + `\r\n`;
    });

    multipartBody += `--${boundary}--`;
    res.send(Buffer.from(multipartBody, 'binary'));
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
