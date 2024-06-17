import Book from "../models/book.mjs";
import fs from "fs";
import mongoSanitize from "express-mongo-sanitize";

export function getAll(req, res, next) {
	Book.find()
		.then((book) => {
			if (book === null) {
				return res.status(404).json({ message: "Aucun livre trouvé" });
			}
			res.status(200).json(book);
		})
		.catch((error) => {
			res.status(500).json({ error }), console.log(error);
		});
}

export function getById(req, res, next) {
	const id = req.params.id;
	Book.findOne({ _id: id })
		.then((book) => {
			if (book === null) {
				return res.status(404).json({ message: "Livre non trouvé" });
			}
			res.status(200).json(book);
		})
		.catch((error) => {
			res.status(500).json({ error }), console.log(error);
		});
}

//Renvoie un tableau des 3 livres de la base de données ayant la meilleure note moyenne

export function getBestRating(req, res, next) {
	Book.find()
		.sort({ averageRating: -1 })
		.limit(3)
		.then((book) => {
			if (book === null) {
				return res.status(404).json({ message: "Aucun livre trouvé" });
			}
			res.status(200).json(book);
		})
		.catch((error) => {
			res.status(500).json({ error }), console.log(error);
		});
}

// Capture et enregistre l'image, analyse le livre transformé en chaîne de caractères, et l'enregistre dans la base de données en définissant correctement son ImageUrl. Initialise la note moyenne du livre à 0 et le rating avec un tableau vide. Remarquez que le corps de la demande initiale est vide ; lorsque Multer est ajouté, il renvoie une chaîne pour le corps de la demande en fonction des données soumises avec le fichier.

export function create(req, res, next) {
	const sanitizeBook = mongoSanitize.sanitize(req.body.book); 
	const bookObject = JSON.parse(sanitizeBook);
	delete bookObject.userId;
	bookObject.userId = req.auth.userId;

	// Verify that publication year is a number
	if (isNaN(bookObject.year)) {
		return res.status(400).json({ message: "Year must be a number" });
	}

	// Verify Date
	if (bookObject.year < 0 || bookObject.year > new Date().getFullYear()) {
		return res.status(400).json({ message: "Year must be a valid year" });
	}

	const book = new Book({
		...bookObject,
	 	imageUrl: `${req.protocol}://${req.get("host")}/images/${req.file.filename}`,
	});

	book.save()
		.then(() => res.status(201).json({ message: "Book save !" }))
		.catch((error) => {
			res.status(400).json({ error }), console.log(error);
		});
}

export function updateById(req, res, next) {
	const bodySanitize = mongoSanitize.sanitize(req.body);
	const authSanitize = mongoSanitize.sanitize(req.auth); 
	const paramsSanitize = mongoSanitize.sanitize(req.params);
	const fileSanitize = mongoSanitize.sanitize(req.file);
	const bookObject = bodySanitize.file
		? {
				...JSON.parse(bodySanitize.book),
				imageUrl: `${req.protocol}://${req.get("host")}/images/${fileSanitize.filename}`,
		  }
		: { ...bodySanitize };

	Book.findOne({ _id: paramsSanitize.id })
		.then((book) => {
			if (book.userId != authSanitize.userId) {
				res.status(401).json({ message: "Not authorized" });
				console.log("Not authorized");
			} else {
				Book.updateOne({ id: paramsSanitize.id }, { ...bookObject, id: paramsSanitize.id })
					.then(() => res.status(200).json({ message: "Livre modifié!" }))
					.catch((error) => {
						res.status(401).json({ error }), console.log(error);
					});
			}
		})
		.catch((error) => {
			console.log(error);
			res.status(400).json({ error });
		});
}

export function deleteById(req, res, next) {
	const sanitizerReq = mongoSanitize.sanitize(req);
	Book.findOne({ _id: sanitizerReq.params.id })
		.then((book) => {
			if (book.userId != sanitizerReq.auth.userId) {
				console.log("Not authorized");
				res.status(401).json({ message: "Not authorized" });
			} else {
				const filename = book.imageUrl.split("/images/")[1];
				fs.unlink(`images/${filename}`, () => {
					Book.deleteOne({ _id: sanitizerReq.params.id })
						.then(() => {
							res.status(200).json({ message: "Objet supprimé !" });
						})
						.catch((error) => {
							res.status(401).json({ error }), console.log(error);
						});
				});
			}
		})
		.catch((error) => {
			res.status(500).json({ error }), console.log(error);
		});
}
export function rateById(req, res, next) {
	const sanitizerReq = mongoSanitize.sanitize(req);
	Book.findOne({ _id: sanitizerReq.params.id })
		.then((book) => {

			//Check si l'utilisateur a déjà noté le livre
			const alreadyRated = book.ratings.find((rating) => rating.userId === sanitizerReq.auth.userId);
			if (alreadyRated) {
				return res.status(400).json({ message: "Vous avez déjà noté ce livre" });
			}

			//Check si la note est comprise entre 0 et 5
			if (sanitizerReq.body.rating < 0 || sanitizerReq.body.rating > 5) {
				return res.status(400).json({ message: "La note doit être comprise entre 0 et 5" });
			}

			const rate = { userId: sanitizerReq.auth.userId, grade: sanitizerReq.body.rating };
			book.ratings.push(rate);

			const averageRate = book.ratings.reduce((acc, rating) => acc + rating.grade, 0) / book.ratings.length;

			Book.updateOne({ _id: sanitizerReq.params.id }, { ratings: book.ratings, averageRating: averageRate.toFixed(1) })
				.then(() => {
					res.status(200).json(book);
				})
				.catch((error) => {
					res.status(401).json({ error }), console.log(error);
				});
		})
		.catch((error) => {
			res.status(500).json({ error }), console.log(error);
		});
}
