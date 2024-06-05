import { Router } from "express";
import middleware from "../middleware/auth.mjs";
import { getAll, getById, getBestRating, create, rateById, updateById, deleteById } from "../controllers/book.mjs";
import multer from "../middleware/multer-config.mjs";

const books = Router();

//GET
books.get("", getAll);
books.get("/bestrating", getBestRating);
books.get("/:id", getById);

//POST
books.post("", middleware, multer, create); //need token
books.post("/:id/rating", middleware, rateById); //need token

//PUT
books.put("/:id", middleware, multer, updateById); //need token

//DELETE
books.delete("/:id", middleware, deleteById); //need token

export default books;
