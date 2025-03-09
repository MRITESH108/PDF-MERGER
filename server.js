const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { PDFDocument } = require('pdf-lib');

const app = express();
const upload = multer({ dest: 'uploads/' });

async function mergePDFs(pdfPaths) {
  const mergedPdf = await PDFDocument.create();

  for (const pdfPath of pdfPaths) {
    const existingPdfBytes = fs.readFileSync(pdfPath);
    const existingPdf = await PDFDocument.load(existingPdfBytes);
    const copiedPages = await mergedPdf.copyPages(existingPdf, existingPdf.getPageIndices());
    copiedPages.forEach(page => {
      mergedPdf.addPage(page);
    });
  }

  const mergedPdfBytes = await mergedPdf.save();
  const outputPath = path.join(__dirname, 'uploads', 'merged.pdf');
  fs.writeFileSync(outputPath, mergedPdfBytes);

  return outputPath;
}

app.post('/merge', upload.array('pdfs'), async (req, res) => {
  const pdfPaths = req.files.map(file => file.path);

  try {
    const mergedPath = await mergePDFs(pdfPaths);
    res.download(mergedPath, 'merged.pdf', () => {
      // Clean up uploaded files
      pdfPaths.forEach(filePath => fs.unlinkSync(filePath));
    });
  } catch (err) {
    res.status(500).send('Error merging PDFs: ' + err.message);
  }
});

app.listen(3000, () => {
  console.log('PDF Merger app listening on port https://localhost:${port}');
});
