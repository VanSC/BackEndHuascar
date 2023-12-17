import { conectar } from "../database/database";
import { realizarOCR } from "./ocr";
const registrarVehiculo = async (req, res) => {
  try {
    const { placa, imagenPath, idUsuario } = req.body;

    // Realizar OCR en la imagen para obtener la carga útil
    const numbersWithComma = await realizarOCR(imagenPath);
    const numbersAsInt = numbersWithComma.map(numStr => parseInt(numStr.replace(',', ''), 10));
    console.log('Carga útil extraída como entero:', numbersAsInt);


    // Validar si el OCR devolvió un valor válido
    if (!Array.isArray(numbersAsInt) || numbersAsInt.length === 0 || isNaN(numbersAsInt[0])) {
      return res.status(400).json({ success: false, message: 'El OCR no devolvió un valor numérico válido.' });
    }

    // Obtener la conexión a la base de datos
    const connection = await conectar();

    // Buscar el tipo de vehículo basado en la carga útil OCR
    const [tipoVehiculo] = await connection.execute(
      'SELECT idTipoVehiculo, precio FROM tiposvehiculos WHERE cargaMin <= ? AND cargaMax >= ?',
      [numbersAsInt[0], numbersAsInt[0]]
    );

    if (tipoVehiculo.length > 0) {
      const { idTipoVehiculo, precio } = tipoVehiculo[0];
      console.log('Tipo de vehículo encontrado:', tipoVehiculo);

      // Registrar el vehículo en la tabla registroVehiculo con la fecha y hora actuales
      const result = await connection.execute(
        'INSERT INTO registroVehiculo (placa, fechaRegistro, horaRegistro, precio, cargaUtil, idUsuario, idTipoVehiculo) VALUES (?, CURRENT_DATE(), CURTIME(), ?, ?, ?, ?)',
        [placa, precio, numbersAsInt[0], idUsuario, idTipoVehiculo]
      );

      const idRegistro = result.insertId;
      console.log('Registro de vehículo insertado:', result);

      res.status(200).json({ success: true, idRegistro, message: 'Vehículo registrado exitosamente.' });
    } else {
      res.status(404).json({ success: false, message: 'No se encontró un tipo de vehículo para la carga útil proporcionada.' });
    }
  } catch (error) {
    console.error('Error al registrar el vehículo:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor.' });
  }
};

// Listar los registros de vehículos
const listarRegistrosVehiculo = async (req, res) => {
  try {
    const connection = await conectar();
    const result = await connection.query(`
      SELECT
        r.idRegistro,
        r.placa,
        r.fechaRegistro,
        r.horaRegistro,
        r.precio,
        r.cargaUtil,
        u.nombre AS nombreUsuario,
        tv.tipo AS tipoVehiculo
      FROM
        registroVehiculo r
      JOIN
        usuario u ON r.idUsuario = u.idUsuario
      JOIN
        tiposvehiculos tv ON r.idTipoVehiculo = tv.idTipoVehiculo
    `);
    res.json(result[0]);
  } catch (error) {
    console.error('Error al listar los registros de vehículos:', error);
    res.status(500).send(error.message);
  }
};


export const methods = {
  registrarVehiculo,
  listarRegistrosVehiculo
};