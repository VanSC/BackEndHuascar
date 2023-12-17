import { Router } from 'express';
import { methods as usuarioController } from '../controllers/userController';
import {conectar} from "./../database/database"

const router = Router();

router.post('/api/adduser', usuarioController.addUsuario);
router.get('/api/usuarios/:dni', usuarioController.getUsuarioByDNI);
router.post('/api/login', usuarioController.login);

export default router;
