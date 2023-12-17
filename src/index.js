import app from "./app"
import { conectar } from "./database/database";

const main = async () => {
    const conexionExitosa = await conectar();
    if (conexionExitosa) {
        app.listen(app.get("port"));
        console.log('La aplicación se iniciará...');
        console.log(`Server on port ${app.get("port")}`);
    } else {
        console.log('No se pudo conectar a la base de datos. La aplicación no se iniciará.');
    }
}

main();
