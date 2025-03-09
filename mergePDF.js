const fs = require('fs');
const path = require('path');
const { PDFDocument } = require('pdf-lib');

async function mergePDFs(pdfPaths) {
  // Create a new PDF document
  const mergedPdf = await PDFDocument.create();

  for (const pdfPath of pdfPaths) {
    const existingPdfBytes = fs.readFileSync(pdfPath);
    const existingPdf = await PDFDocument.load(existingPdfBytes);
    const copiedPages = await mergedPdf.copyPages(existingPdf, existingPdf.getPageIndices());
    
    // Add all pages from the current PDF to the merged document
    copiedPages.forEach(page => {
      mergedPdf.addPage(page);
    });
  }

  // Serialize the merged PDF and save it to a file
  const mergedPdfBytes = await mergedPdf.save();
  const outputPath = path.join(__dirname, 'merged.pdf');
  fs.writeFileSync(outputPath, mergedPdfBytes);

  console.log(`Merged PDF saved at: ${outputPath}`);
}

// Example usage with two PDF file paths
const pdfPaths = [
  path.join(__dirname, 'file1.pdf'),
  path.join(__dirname, 'file2.pdf'),
];

mergePDFs(pdfPaths).catch(err => console.error(err));
