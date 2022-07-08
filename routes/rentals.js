const { Rental, validate } = require("../models/rental");
const mongoose = require("mongoose");
const Fawn = require("fawn");
const express = require("express");
const { Customer } = require("../models/customer");
const { Movie } = require("../models/movie");
const router = express.Router();

Fawn.init("mongodb://localhost/vidly");

router.get("/", async (req, res) => {
  const rentals = await Rental.find().sort("-dateOut");
  res.send(rentals);
});

router.get("/:id", async (req, res) => {
  const rental = await Movie.findById(req.params.id);

  if (!rental)
    return res.status(404).send("The selected rental does not exist");

  res.send(rental);
});

router.post("/", async (req, res) => {
  const result = validate(req.body);
  if (result.error)
    return res.status(400).send(result.error.details[0].message);

  const customer = await Customer.findById(req.body.customerId);
  if (!customer) return res.status(400).send("Invalid customer");

  const movie = await Movie.findById(req.body.movieId);
  if (!movie) return res.status(400).send("Invalid movie");

  if (movie.numberInStock === 0)
    return res.status(400).send("Movie is out of stock");

  let rental = new Rental({
    movie: {
      _id: movie._id,
      title: movie.title,
      dailyRentalRate: movie.dailyRentalRate,
    },
    customer: {
      _id: customer._id,
      name: customer.name,
      phone: customer.phone,
    },
  });

  try {
    new Fawn.Task()
      .save("rentals", rental)
      .update("movies", { _id: movie._id }, { $inc: { numberInStock: -1 } })
      .run();

    res.send(rental);
  } catch (error) {
    res.status(500).send("Something failed");
  }
});

module.exports = router;
