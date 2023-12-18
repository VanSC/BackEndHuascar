import {conectar} from "./../database/database"
import {Router} from "express"
import { methods as registroController } from "../controllers/registroController"

const router = Router();

router.post("/api/registrarvehiculo", registroController.registrarVehiculo);
router.get("/api/registros", registroController.listarRegistrosVehiculo);
router.get("filtrofechatipo", registroController.listarRegistrosVehiculoPorTipoVehiculo)

export default router;