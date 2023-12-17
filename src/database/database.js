import mysql from 'mysql2/promise';
import config from '../config/config';

let connection;

const conectar = async () => {
  try {
    // Configuración de la conexión a la base de datos
    connection = await mysql.createConnection({
      host: config.host,
      user: config.user,
      password: config.password,
      database: config.database,
    });
    console.log('Conexión exitosa a la base de datos');
    return connection;
  } catch (error) {
    console.error('Error de conexión a la base de datos:', error);
    throw error;
  }
};

export { conectar };
