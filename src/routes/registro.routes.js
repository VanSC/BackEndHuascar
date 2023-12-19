import {conectar} from "./../database/database"
import {Router} from "express"
import { methods as registroController } from "../controllers/registroController"

const router = Router();

router.post("/api/registrarvehiculo", registroController.registrarVehiculo);
router.get("/api/registros", registroController.listarRegistrosVehiculo);
router.post("/api/contarregistros", registroController.filtroporTipoYContar);
router.get('/api/sumarporfecha', registroController.sumarIngresosPorFecha);
router.get('/api/preciototaldeldia', registroController.sumarPrecioTotalPorFecha);
router.get('/api/contarporsemana', registroController.sumarPrecioTotalPorSemana)
router.get("/api/cantidadtipo", registroController.contarRegistrosPorTipo);
router.post("/api/filtroregistro", registroController.filtrarRegistros);
router.get('/api/ordenarporhora', registroController.listarRegistrosVehiculofecha);
router.get("/api/registrossemanales", registroController.contarRegistrosPorSemana);
router.get("/api/registrosmensuales", registroController.contarRegistrosPorMes);


export default router;