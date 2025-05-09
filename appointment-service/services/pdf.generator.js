const PDFDocument = require('pdfkit');
  const { Readable } = require('stream');

  const generatePDF = (assessment) => {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 50 });
      const buffers = [];

      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfData = Buffer.concat(buffers);
        resolve(pdfData);
      });
      doc.on('error', reject);

      // En-tête
      doc.fontSize(20).text('Bilan Initial', { align: 'center' });
      doc.moveDown();
      doc.fontSize(12).text(`Patient: ${assessment.patientName} ${assessment.patientFirstName}`);
      doc.text(`Date: ${new Date().toLocaleDateString()}`);
      doc.moveDown();

      // Section: Histoire pondérale
      doc.fontSize(14).text('Histoire Pondérale', { underline: true });
      doc.fontSize(12);
      doc.text(`Âge de début: ${assessment.data.weightHistory.startAge}`);
      doc.text(`Poids le plus bas (adulte): ${assessment.data.weightHistory.lowestAdultWeight || 'N/A'} kg`);
      doc.text(`Poids le plus haut (adulte): ${assessment.data.weightHistory.highestAdultWeight || 'N/A'} kg`);
      doc.moveDown();

      // Section: Activité physique
      doc.fontSize(14).text('Activité Physique', { underline: true });
      doc.fontSize(12);
      doc.text(`Profession: ${assessment.data.physicalActivity.profession || 'N/A'}`);
      doc.text(`Intensité au travail: ${assessment.data.physicalActivity.workIntensity}`);
      doc.moveDown();

      // Section: Habitudes alimentaires
      doc.fontSize(14).text('Habitudes Alimentaires', { underline: true });
      doc.fontSize(12);
      assessment.data.eatingHabits.meals.forEach((meal, index) => {
        doc.text(`Repas ${index + 1}: ${meal.time}, ${meal.setting}, ${meal.location}`);
      });

      doc.end();
    });
  };

  module.exports = { generatePDF };