import { conectar } from "../database/database";
import generatePDF from '../pdfGenerator'; // Importa el módulo pdfGenerator
const PDFDocument = require('pdfkit'); 
const path = require('path');

const generarInformePDF = async (req, res) => {
  try {
    const connection = await conectar();
    const result = await connection.query(
      "SELECT placa, fechaRegistro, horaRegistro, precio FROM registroVehiculo"
    );

    // Ruta donde se guardará el PDF
    const outputPath = path.join(__dirname, '../public/informe.pdf');

    // Generar el PDF con los registros obtenidos
    generatePDF(result[0], outputPath);

    // Enviar el PDF como respuesta
    res.sendFile(outputPath);
  } catch (error) {
    console.error('Error al generar el informe PDF:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor.' });
  }
};

export const methods = { 
    generarInformePDF
};
