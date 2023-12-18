import { Router } from 'express';
import { methods as tipoController } from '../controllers/tipoVehiculoController';

const router = Router();

router.get('/api/tiposvehiculos', tipoController.listarTiposVehiculos);

export default router;
