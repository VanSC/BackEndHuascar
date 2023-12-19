import { conectar } from "../database/database";
import { realizarOCR } from "./ocr";

//registrar vehiculos
const registrarVehiculo = async (req, res) => {
  try {
    const { placa, imagenPath, idUsuario } = req.body;
    const numbersWithComma = await realizarOCR(imagenPath);
    const numbersAsInt = numbersWithComma.map(numStr => parseInt(numStr.replace(',', ''), 10));
    console.log('Carga útil extraída como entero:', numbersAsInt);

    if (!Array.isArray(numbersAsInt) || numbersAsInt.length === 0 || isNaN(numbersAsInt[0])) {
      return res.status(400).json({ success: false, message: 'El OCR no devolvió un valor numérico válido.' });
    }

    const connection = await conectar();

    const [tipoVehiculo] = await connection.execute(
      'SELECT idTipoVehiculo, precio FROM tiposvehiculos WHERE cargaMin <= ? AND cargaMax >= ?',
      [numbersAsInt[0], numbersAsInt[0]]
    );

    if (tipoVehiculo.length > 0) {
      const { idTipoVehiculo, precio } = tipoVehiculo[0];
      console.log('Tipo de vehículo encontrado:', tipoVehiculo);

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
        usuario u ON r.idUsuario = u.id
      JOIN
        tiposvehiculos tv ON r.idTipoVehiculo = tv.idTipoVehiculo
    `);
    res.json(result[0]);
  } catch (error) {
    console.error('Error al listar los registros de vehículos:', error);
    res.status(500).send(error.message);
  }
};

const listarRegistrosVehiculofecha = async (req, res) => {
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
        usuario u ON r.idUsuario = u.id
      JOIN
        tiposvehiculos tv ON r.idTipoVehiculo = tv.idTipoVehiculo
      WHERE DATE(r.fechaRegistro) = CURDATE()
      ORDER BY r.idRegistro DESC, r.idRegistro DESC
    `);
    res.json(result[0]);
  } catch (error) {
    console.error('Error al listar los registros de vehículos:', error);
    res.status(500).send(error.message);
  }
};


const filtroporTipoYContar = async (req, res) => {
  try {
    const { tipoVehiculo } = req.body;
    const connection = await conectar();
    const result = await connection.query(`
      SELECT
        tv.tipo AS tipoVehiculo,
        COUNT(*) AS cantidadRegistros
      FROM
        registroVehiculo r
      JOIN
        tiposvehiculos tv ON r.idTipoVehiculo = tv.idTipoVehiculo
      WHERE
        tv.tipo = ?
      GROUP BY
        tv.tipo
    `, [tipoVehiculo]);

    res.json(result[0]);
  } catch (error) {
    console.error('Error al listar los registros de vehículos por tipo de vehículo y contar:', error);
    res.status(500).send(error.message);
  }
};

// Sumar la cantidad de ingresos durante todo el día
const sumarIngresosPorFecha = async (req, res) => {
  try {
    const connection = await conectar();
    const result = await connection.query(`
      SELECT
        DATE(fechaRegistro) AS fecha,
        COUNT(*) AS cantidadRegistros
      FROM
        registroVehiculo
      WHERE
        DATE(fechaRegistro) = CURDATE()  -- Filtrar por la fecha actual
      GROUP BY
        DATE(fechaRegistro)
    `);

    res.json(result[0]);
  } catch (error) {
    console.error('Error al sumar la cantidad de ingresos por fecha:', error);
    res.status(500).send(error.message);
  }
};

const sumarPrecioTotalPorFecha = async (req, res) => {
  try {
    const connection = await conectar();
    const result = await connection.query(`
      SELECT
        SUM(r.precio) AS precioTotal
      FROM
        registroVehiculo r
      WHERE
        DATE(r.fechaRegistro) = CURDATE()
    `);
    const precioTotal = result[0][0].precioTotal;
    res.json({ precioTotal });
  } catch (error) {
    console.error('Error al sumar el precio total por fecha:', error);
    res.status(500).send(error.message);
  }
};

const sumarPrecioTotalPorSemana = async (req, res) => {
  try {
    const connection = await conectar();
    const result = await connection.query(`
      SELECT
        WEEK(r.fechaRegistro) AS semana,
        SUM(r.precio) AS precioTotal
      FROM
        registroVehiculo r
      GROUP BY
        WEEK(r.fechaRegistro)
    `);

    const precioTotalPorSemana = result[0];
    res.json(precioTotalPorSemana);
  } catch (error) {
    console.error('Error al sumar el precio total por semana:', error);
    res.status(500).send(error.message);
  }
};

const contarRegistrosPorSemana = async (req, res) => {
  try {
    const connection = await conectar();
    const result = await connection.query(`
      SELECT
        COUNT(*) AS cantidadRegistros
      FROM
        registroVehiculo r
      WHERE
        WEEK(r.fechaRegistro) = WEEK(CURDATE())
      GROUP BY
        WEEK(r.fechaRegistro)
    `);
    const registrosPorSemana = result[0];
    res.json(registrosPorSemana);
  } catch (error) {
    console.error('Error al contar la cantidad de registros por semana:', error);
    res.status(500).send(error.message);
  }
};

const contarRegistrosPorMes = async (req, res) => {
  try {
    const connection = await conectar();
    const result = await connection.query(`
      SELECT
        MONTH(r.fechaRegistro) AS mes,
        COUNT(*) AS cantidadRegistros
      FROM
        registroVehiculo r
      WHERE
        MONTH(r.fechaRegistro) = MONTH(CURDATE())
      GROUP BY
        MONTH(r.fechaRegistro)
    `);

    const registrosPorMes = result[0];
    res.json(registrosPorMes);
  } catch (error) {
    console.error('Error al contar la cantidad de registros por mes:', error);
    res.status(500).send(error.message);
  }
};

const contarRegistrosPorTipo = async (req, res) => {
  try {
    const connection = await conectar();

    const result = await connection.query(`
      SELECT
        tv.tipo AS tipoVehiculo,
        COUNT(*) AS cantidadRegistros
      FROM
        registroVehiculo r
      JOIN
        tiposvehiculos tv ON r.idTipoVehiculo = tv.idTipoVehiculo
      GROUP BY
        tv.tipo
    `);

    res.json(result[0]);
  } catch (error) {
    console.error('Error al contar registros por tipo de vehículo:', error);
    res.status(500).send(error.message);
  }
};

const filtrarRegistros = async (req, res) => {
  try {
    const connection = await conectar();

    // Obtén los parámetros de la solicitud
    const { placa, fecha, hora, precio, cargaUtil, idTipoVehiculo } = req.body;

    // Construye la parte de la consulta que filtra por parámetros existentes
    const whereClause = [];
    if (placa) whereClause.push(`r.placa = '${placa}'`);
    if (fecha) whereClause.push(`DATE(r.fechaRegistro) = '${fecha}'`);
    if (hora) whereClause.push(`r.horaRegistro = '${hora}'`);
    if (precio) whereClause.push(`r.precio = ${precio}`);
    if (cargaUtil) whereClause.push(`r.cargaUtil = ${cargaUtil}`);
    if (idTipoVehiculo) whereClause.push(`r.idTipoVehiculo = ${idTipoVehiculo}`);

    // Combina los filtros con "AND"
    const whereCondition = whereClause.length > 0 ? `WHERE ${whereClause.join(' AND ')}` : '';

    const result = await connection.query(`
    SELECT
    r.idRegistro,
    r.placa,
    r.fechaRegistro,
    r.horaRegistro,
    r.precio,
    r.cargaUtil,
    r.idUsuario,
    t.tipo as tipoVehiculo
  FROM
    registroVehiculo r
  JOIN
    tiposvehiculos t ON r.idTipoVehiculo = t.idTipoVehiculo
  ${whereCondition};
    `);

    res.json(result[0]);
  } catch (error) {
    console.error('Error al filtrar registros:', error);
    res.status(500).send(error.message);
  }
};


export const methods = {
  registrarVehiculo,
  listarRegistrosVehiculo,
  filtroporTipoYContar,
  sumarIngresosPorFecha,
  sumarPrecioTotalPorFecha,
  sumarPrecioTotalPorSemana,
  contarRegistrosPorSemana,
  contarRegistrosPorTipo,
  filtrarRegistros,
  listarRegistrosVehiculofecha,
  contarRegistrosPorMes
};