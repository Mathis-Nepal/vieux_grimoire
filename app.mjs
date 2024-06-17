import express from "express";
import { auth, books } from "./routes/route.mjs";
import bodyParser from "body-parser";
import { connectDb } from "./utils/utils.mjs";
import path from "path";
import { fileURLToPath } from "url";
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
import mongoSanitize from "express-mongo-sanitize";

// Détermine le nom de fichier et le répertoire courant
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(cors());

app.use(helmet({crossOriginEmbedderPolicy: false,crossOriginResourcePolicy: false}));


connectDb();

// Créez un limiteur de taux de base
const limiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: 100, // Limite chaque IP à 100 requêtes par `window` (ici, par 15 minutes)
	message: 'Too many requests from this IP, please try again after 15 minutes',
  });

  // Appliquez le limiteur à toutes les requêtes
app.use(limiter);

app.use((req, res, next) => {
	res.setHeader("Access-Control-Allow-Origin", "*");
	res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content, Accept, Content-Type, Authorization");
	res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS");
	next();
});

app.use(bodyParser.json());

//print the request
app.use((req, res, next) => {
	console.log(req);
	next();
});

app.use("/api/auth", auth);
app.use("/api/books", books);


app.use("/images", express.static(path.join(__dirname, "images")));

export default app;
