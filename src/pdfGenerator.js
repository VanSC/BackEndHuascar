// pdfGenerator.js
const PDFDocument = require('pdfkit');
const fs = require('fs');

function generatePDF(data, outputPath) {
  const doc = new PDFDocument();

  // Lógica para agregar contenido al PDF
  doc.fontSize(16).text('Informe PDF', { align: 'center' });
  doc.moveDown();

  // Agregar datos al PDF para cada registro
  data.forEach((registro) => {
    doc.text(`Placa: ${registro.placa}`);
    doc.text(`Fecha de Registro: ${registro.fechaRegistro}`);
    doc.text(`Hora de Registro: ${registro.horaRegistro}`);
    doc.text(`Precio: ${registro.precio}`);
    doc.moveDown(); // Agregar espacio entre registros
  });

  // Guardar el PDF en el archivo de salida
  doc.pipe(fs.createWriteStream(outputPath));
  doc.end();
}

module.exports = generatePDF;