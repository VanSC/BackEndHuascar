const Tesseract = require('tesseract.js');
const fs = require('fs').promises;

async function realizarOCR(imagenPath) {
  try {
    const resultadoOCR = await Tesseract.recognize(
      imagenPath,
      'eng',
      {
        logger: info => console.log(info),
        tessedit_char_whitelist: '0123456789', 
        preserve_interword_spaces: '1'
      }
    );

    const textoExtraido = resultadoOCR.data.text.toLowerCase();
    console.log('Texto extraído:', textoExtraido);

    // Guardar la salida en un archivo
    await fs.writeFile('ocr_output.txt', textoExtraido);

    // Dividir el texto en líneas
    const lineas = textoExtraido.split('\n');

    // Buscar la línea que contiene "carga util"
    const lineaCargaUtil = lineas.find(linea => linea.includes('util'));

    if (lineaCargaUtil) {
      // Extraer todos los números, incluidos los decimales, de la línea que contiene "carga util"
      const numbers = lineaCargaUtil.match(/\b\d+(?:,\d+)?\b/g);

      const numbersWithComma = lineaCargaUtil
        .match(/\b\d+(?:\.\d+)?\b/g) // Extraer números, incluidos los decimales
        .map(number => number.replace('.', ',')); // Reemplazar el punto por la coma en los números

      console.log('Números extraídos con coma:', numbersWithComma);


      return numbersWithComma;
    } else {
      console.log('No se encontró la línea de carga útil');
      return null;
    }
  } catch (error) {
    console.error('Error al realizar OCR:', error);
    throw error;
  }
}

module.exports = { realizarOCR };
