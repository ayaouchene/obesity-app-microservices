const PDFDocument = require('pdfkit');
const { Readable } = require('stream');

const generatePDF = (assessment) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument();
    const buffers = [];

    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', () => {
      const pdfData = Buffer.concat(buffers);
      resolve(pdfData);
    });
    doc.on('error', reject);

    // Contenu du PDF
    doc.fontSize(16).text('Bilan Initial', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Patient ID: ${assessment.patientId}`);
    doc.text(`Appointment ID: ${assessment.appointmentId}`);
    doc.moveDown();
    doc.text('Données du bilan:');
    Object.entries(assessment.data).forEach(([key, value]) => {
      doc.text(`${key}: ${value}`);
    });

    doc.end();
  });
};

module.exports = { generatePDF };