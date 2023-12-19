import { conectar } from "../database/database";
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
import config from '../config/config';

const addUsuario = async (req, res) => {
  try {
    const { nombre, apellido, dni, telefono, genero, fechaNacimiento, contraseña, idRol } = req.body;

    if (nombre === undefined || apellido === undefined || dni === undefined ||
      telefono === undefined || genero === undefined || fechaNacimiento === undefined ||
      contraseña === undefined || idRol === undefined) {
      res.status(400).json({ "message": "Bad Request. Please fill all fields." });
      return;
    }

    // Generar el hash de la contraseña
    const hashedPassword = await bcrypt.hash(contraseña, 10);

    const connection = await conectar();
    const result = await connection.query(`
            INSERT INTO usuario (nombre, apellido, dni, telefono, genero, fechaNacimiento, contraseña, idRol) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [nombre, apellido, dni, telefono, genero, fechaNacimiento, hashedPassword, idRol]
    );

    res.json({ "message": "Usuario Registrado Correctamente" });

  } catch (error) {
    res.status(500);
    res.send(error.message);
  }
};

const getUsuarioByDNI = async (req, res) => {
  try {
    const { dni } = req.params;
    const connection = await conectar();
    const result = await connection.query("SELECT * FROM usuario WHERE dni = ?", dni);

    if (result[0].length === 0) {
      res.status(404).json({ "message": "Usuario no encontrado" });
    } else {
      res.json(result[0]);
    }
  } catch (error) {
    res.status(500);
    res.send(error.message);
  }
};

const login = async (req, res) => {
  let connection;

  try {
    const { dni, contraseña } = req.body;
    connection = await conectar();

    try {
      const [rows] = await connection.query('SELECT * FROM usuario WHERE dni = ?', [dni]);

      if (rows.length === 0) {
        res.status(404).json({ "message": "Usuario no encontrado" });
        return;
      }

      const usuario = rows[0];

      const match = await bcrypt.compare(contraseña, usuario.contraseña);

      if (match) {
        const token = jwt.sign(
          { userId: usuario.id, dni: usuario.dni },
          config.secret,
          { expiresIn: '1h' } 
        );

        // Enviar el token en la respuesta
        res.json({ "message": "Inicio de sesión exitoso", token, usuario });
      } else {
        res.status(401).json({ "message": "Credenciales inválidas" });
      }
    } catch (error) {
      console.error('Error en la consulta:', error);
      res.status(500).send('Error interno del servidor');
    }
  } catch (error) {
    console.error('Error al conectar a la base de datos:', error);
    res.status(500).send('Error interno del servidor');
  }
};


export const methods = {
  addUsuario,
  getUsuarioByDNI,
  login
};
