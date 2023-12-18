// app.js
import express from "express";
import morgan from "morgan";
import registroRoutes from "./routes/registro.routes";
import userRoutes from "./routes/user.routes";
import reporteRoutes from "./routes/reporte.routes";
import tiposRoutes from "./routes/tipoVehiculo.route";
const cors = require('cors');
const app = express();

// Settings
app.set("port", 3000);
app.use(express.urlencoded({extended: true}));
// Middlewares
app.use(morgan("dev"));
app.use(express.json());
app.use(cors());
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ success: false, message: 'Error interno del servidor.', error: err.message });
  });
  
// Routes
app.use(registroRoutes);
app.use(userRoutes);
app.use(reporteRoutes);
app.use(tiposRoutes);

export default app;
