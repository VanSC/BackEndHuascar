import { conectar } from "../database/database";

const listarTiposVehiculos = async (req, res) => {
  try {
    const connection = await conectar();
    const result = await connection.query('SELECT * FROM tiposvehiculos');
    res.json(result[0]);
  } catch (error) {
    console.error('Error al listar los tipos de vehículos:', error);
    res.status(500).send(error.message);
  }
};

export const methods = {
  listarTiposVehiculos
};
