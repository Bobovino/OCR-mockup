import express from 'express'
import multer from 'multer'
import cors from 'cors'
import { createExtractorFromData, ArcFile, FileHeader } from 'node-unrar-js'
import { Request, Response } from 'express'

const app = express()
const port = 3004

// Enable CORS for local testing
app.use(cors())

// Set up multer with memory storage
const storage = multer.memoryStorage()
const upload = multer({ storage: storage })

app.post('/get_info_from_file', upload.single('file'), async (req: Request, res: Response) => {
  if (!req.file) {
    return res.status(400).send('No file uploaded.')
  }

  try {
    const fileBuffer = req.file.buffer

    // Create an extractor from the buffer
    const extractor = await createExtractorFromData({ data: fileBuffer })

    // Get the list of files in the archive
    const list = extractor.getFileList()
    const fileHeaders = Array.from(list.fileHeaders).map((f: FileHeader) => f.name)

    // Extract all files
    const extracted = extractor.extract({ files: fileHeaders })

    // Filter and map PDF files
    const pdfFiles = Array.from(extracted.files)
      .filter((file: ArcFile<Uint8Array>) => file.fileHeader.name.toLowerCase().endsWith('.pdf'))
      .map((file: ArcFile<Uint8Array>) => file.fileHeader.name)

    res.json({ files: pdfFiles })
  } catch (error) {
    console.error('Error processing RAR file:', error)
    res.status(500).send('Error processing RAR file')
  }
})


app.post('/upload', upload.array('files'), async (req: Request, res: Response) => {
  if (!req.files || !(req.files instanceof Array)) {
    return res.status(400).send('No files uploaded.')
  }

  try {
    const fileBuffers = req.files.map(file => ({
      originalname: file.originalname,
      buffer: file.buffer.toString('base64'),
      mimetype: file.mimetype,
    }))

    // Return the files back in the response
    res.json(fileBuffers)
  } catch (error) {
    console.error('Error processing files:', error)
    res.status(500).send('Error processing files')
  }
})

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
