const mongoose = require("mongoose");
const express = require("express");
const genres = require("./routes/genres");
const customers = require("./routes/customers");
const movies = require("./routes/movies");

const app = express();

mongoose
  .connect("mongodb://localhost/vidly")
  .then(() => console.log("Connected to mongodb..."))
  .catch((error) => console.error("Could not connect to mongodb...", error));

app.use(express.json());
app.use("/api/genres", genres);
app.use("/api/customers", customers);
app.use("/api/movies", movies);

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Listening on port ${port}....`));
