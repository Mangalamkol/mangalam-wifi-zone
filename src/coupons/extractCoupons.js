const fs = require("fs");
const pdfParse = require("pdf-parse");

async function extractCouponsFromPDF(filePath) {
  const dataBuffer = fs.readFileSync(filePath);
  const data = await pdfParse(dataBuffer);
  const text = data.text;
  const codes = text.match(/[A-Z0-9]{6,}/g) || [];
  return codes.slice(0, 200); // Limit to 200 codes
}

module.exports = { extractCouponsFromPDF };