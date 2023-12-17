import { Router } from 'express';
import { conectar } from "../database/database"
import { methods as reporteController } from "./../controllers/reporteController"

const router = Router();

router.get('/api/reporteregistros', reporteController.generarInformePDF);

export default router;