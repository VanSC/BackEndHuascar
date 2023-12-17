const { realizarOCR } = require('../controllers/ocr');

describe('realizarOCR', () => {
  it('debería reconocer la carga útil desde una imagen válida', async () => {
    const imagenPath = './imagen.jpg';
    const cargaUtil = await realizarOCR(imagenPath);
    expect(cargaUtil).not.toBeNull();
    expect(typeof cargaUtil).toBe('number');
  });

  it('debería devolver null cuando no se encuentra la línea de carga útil', async () => {
    const imagenPath = './imagen.jpg';
    const cargaUtil = await realizarOCR(imagenPath);
    expect(cargaUtil).toBeNull();
  });

  // Agrega más pruebas según tus necesidades
});
