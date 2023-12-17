import { conectar } from "../database/database";
const bcrypt = require('bcryptjs');


const addUsuario = async (req, res) => {
    try {
        const { nombre, apellido, dni, telefono, fechaNacimiento, contraseña, idRol } = req.body;

        if (nombre === undefined || apellido === undefined || dni === undefined ||
            telefono === undefined || fechaNacimiento === undefined ||
            contraseña === undefined || idRol === undefined) {
            res.status(400).json({ "message": "Bad Request. Please fill all fields." });
            return;
        }

        // Generar el hash de la contraseña
        const hashedPassword = await bcrypt.hash(contraseña, 10);

        const connection = await conectar();
        const result = await connection.query(`
            INSERT INTO usuario (nombre, apellido, dni, telefono, fechaNacimiento, contraseña, idRol) 
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [nombre, apellido, dni, telefono, fechaNacimiento, hashedPassword, idRol]
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
    try {
      const { dni, contraseña } = req.body;
  
      // Obtener la conexión desde el pool
      const connection = await pool.getConnection();
  
      try {
        // Consultar el usuario por DNI
        const [rows] = await connection.query('SELECT * FROM usuario WHERE dni = ?', [dni]);
  
        if (rows.length === 0) {
          res.status(404).json({ "message": "Usuario no encontrado" });
          return;
        }
  
        const usuario = rows[0];
  
        // Comparar la contraseña proporcionada con el hash almacenado
        const match = await bcrypt.compare(contraseña, usuario.contraseña);
  
        if (match) {
          res.json({ "message": "Inicio de sesión exitoso", usuario });
        } else {
          res.status(401).json({ "message": "Credenciales inválidas" });
        }
      } catch (error) {
        console.error('Error en la consulta:', error);
        res.status(500).send('Error interno del servidor');
      } finally {
        connection.release(); // Liberar la conexión después de usarla
      }
    } catch (error) {
      console.error('Error al conectar a la base de datos:', error);
      res.status(500).send('Error interno del servidor');
    }
  }

export const methods = {
    addUsuario,
    getUsuarioByDNI,
    login
};
