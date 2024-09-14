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
    const movies = await db.getAllMovies();

    res.render("movies", {
      title: pageTitle,
      movies: movies,
    });
  } catch (err) {
    console.error("Failder to load page: ", err);
    res.status(500).send("an error occured while loading the page.");
  }
};

async function getGenresPage (req, res) {
  try {
    const genres = await db.getAllGenres();

    res.render("genres", {
      title: pageTitle,
      genres: genres,
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

async function getMovieShowcasePage(req, res) {
  const movieName = req.params.movieName.replace(/-/g, ' '); // Convert back to movie name

  try {
    const movie = await db.getMovieByName(movieName);
    const genres = await db.getGenresForMovie(movieName);
    const runtime = calculateMovieLength(movie.duration);

    const capitalizedGenres = genres.map(genre => genre.charAt(0).toUpperCase() + genre.slice(1));
    const youtubeEmededURL = getYouTubeEmbedURL(movie.trailerurl);

    if (movie) {
      res.render("movieShowCase", {
        title: pageTitle,
        movie: movie,
        runtime: runtime,
        youtubeURL: youtubeEmededURL,
        genres: capitalizedGenres
      })
    } else {
      res.status(404).send("Movie not found");
    }
  } catch(err) {
    console.error('Error fetching movie: ', err.message);
    throw new Error(`Error fetching movie: ${err.message}`)
  }

}

const calculateMovieLength = (duration) => {
  const hours = Math.round(duration / 60);

  const remainingMinutes = duration - (hours * 60);

  return `${hours}h ${remainingMinutes}m`;
}

async function deleteMovie(req, res) {
  const movieName = req.params.movieName.replace(/-/g, ' '); 

  try {
    const movieDeleted = await db.deleteMovie(movieName);
    if (movieDeleted) {
      console.log(`Movie: ${movieName} succesfully deleted.`);
    } else {
      console.log('Movie could not be deleted.')
    }

    res.redirect("/movies");
  } catch(err) {
    console.error('Error deleting movie', err.message);
    throw new Error(`Error deleting movie ${err.message}`);
  }
}

const getYouTubeEmbedURL = (url) => {
  const videoId = url.split('v=')[1]; // Extract the video ID from the full URL
  return `https://www.youtube.com/embed/${videoId}`;
}

module.exports = {
  getHomePage,
  getMoviePage,
  getGenresPage,
  getNewMoviePage,
  addNewMovie,
  getMovieShowcasePage,
  deleteMovie
};
