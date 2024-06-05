import express from "express";
import { auth, books } from "./routes/route.mjs";
import bodyParser from "body-parser";
import { connectDb } from "./utils/utils.mjs";
import path from "path";
import { fileURLToPath } from "url";

// Détermine le nom de fichier et le répertoire courant
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

connectDb();

app.use((req, res, next) => {
	res.setHeader("Access-Control-Allow-Origin", "*");
	res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content, Accept, Content-Type, Authorization");
	res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS");
	next();
});

app.use(bodyParser.json());

//print the request
app.use((req, res, next) => {
	console.log(req.originalUrl);
	next();
});

app.use("/api/auth", auth);
app.use("/api/books", books);
app.use("/images", express.static(path.join(__dirname, "images")));

export default app;
