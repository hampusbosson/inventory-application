const db = require("../db/queries");
const { body, validationResult } = require("express-validator");

const pageTitle = "MovieHub";
const movieLengthErr = "must be between 1 and 30 charachters";
const desctiptionLengthErr = "must be between 1 and 120 charachters";

const validateMovie = [
  body("movie-name")
    .trim()
    .isLength({ min: 1, max: 30 })
    .withMessage(`Movie name ${movieLengthErr}`),
  body("description")
    .trim()
    .isLength({ min: 1, max: 120 })
    .withMessage(`Desctiption ${desctiptionLengthErr}`),
];

const getHomePage = (req, res) => {
  try {
    res.render("index", {
      title: pageTitle,
    });
  } catch (err) {
    console.error("Failed to load page: ", { err });
    res.status(500).send("an error occured while loading the page.");
  }
};

async function getMoviePage (req, res) {
  try {
    const movies = await db.getAllmovies();
    
    res.render("movies", {
      title: pageTitle,
      movies: movies,
    });
  } catch (err) {
    console.error("Failder to load page: ", err);
    res.status(500).send("an error occured while loading the page.");
  }
};

const getGenresPage = (req, res) => {
  try {
    res.render("genres", {
      title: pageTitle,
    });
  } catch (err) {
    console.error("Failder to load page: ", err);
    res.status(500).send("an error occured while loading the page.");
  }
};

const getNewMoviePage = (req, res) => {
  try {
    res.render("newMovie", {
      title: pageTitle,
    });
  } catch (err) {
    console.error("Failder to load page: ", err);
    res.status(500).send("an error occured while loading the page.");
  }
};

const addNewMovie = [
  validateMovie,
  async (req, res) => {
    try {
      const {
        name,
        genres,
        description,
        posterURL,
        trailerURL,
        rating, 
        duration, 
        year 
      } = req.body;

      await db.insertMovie(
        name,
        year,
        genres,
        rating,   
        duration, 
        description,
        posterURL,
        trailerURL,
      );

      res.redirect("/movies");
    } catch (err) {
      console.error("Error creating movie: ", err);
      res.status(500).send("Error creating movie");
    }
  },
];

module.exports = {
  getHomePage,
  getMoviePage,
  getGenresPage,
  getNewMoviePage,
  addNewMovie,
};
