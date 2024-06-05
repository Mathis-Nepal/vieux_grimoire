import Book from "../models/book.mjs";
import fs from "fs";

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
	console.log(req.params);
	Book.findOne({ _id: req.params.id })
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
	console.log("getBestRating");
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
	const bookObject = JSON.parse(req.body.book);
	delete bookObject.userId;
	bookObject.userId = req.auth.userId;

	// Verify that publication year is a number
	if (isNaN(bookObject.year)) {
		return res.status(400).json({ message: "Year must be a number" });
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
	const bookObject = req.file
		? {
				...JSON.parse(req.body.book),
				imageUrl: `${req.protocol}://${req.get("host")}/images/${req.file.filename}`,
		  }
		: { ...req.body };

	Book.findOne({ _id: req.params.id })
		.then((book) => {
			if (book.userId != req.auth.userId) {
				res.status(401).json({ message: "Not authorized" });
				console.log("Not authorized");
			} else {
				Book.updateOne({ id: req.params.id }, { ...bookObject, id: req.params.id })
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
	Book.findOne({ _id: req.params.id })
		.then((book) => {
			if (book.userId != req.auth.userId) {
				console.log("Not authorized");
				res.status(401).json({ message: "Not authorized" });
			} else {
				const filename = book.imageUrl.split("/images/")[1];
				fs.unlink(`images/${filename}`, () => {
					Book.deleteOne({ _id: req.params.id })
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
	Book.findOne({ _id: req.params.id })
		.then((book) => {

			//Check si l'utilisateur a déjà noté le livre
			const alreadyRated = book.ratings.find((rating) => rating.userId === req.auth.userId);
			if (alreadyRated) {
				return res.status(400).json({ message: "Vous avez déjà noté ce livre" });
			}

			//Check si la note est comprise entre 0 et 5
			if (req.body.rating < 0 || req.body.rating > 5) {
				return res.status(400).json({ message: "La note doit être comprise entre 0 et 5" });
			}

			const rate = { userId: req.auth.userId, grade: req.body.rating };
			book.ratings.push(rate);

			const averageRate = book.ratings.reduce((acc, rating) => acc + rating.grade, 0) / book.ratings.length;

			Book.updateOne({ _id: req.params.id }, { ratings: book.ratings, averageRating: averageRate.toFixed(1) })
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
