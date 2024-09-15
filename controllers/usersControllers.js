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

    if (!movie) {
      return res.status(404).send("Movie not found");
    }

    const genres = await db.getGenresForMovie(movieName);
    const runtime = calculateMovieLength(movie.duration);

    // Capitalize genres
    const capitalizedGenres = genres.map(genre => genre.charAt(0).toUpperCase() + genre.slice(1));

    // Safely generate YouTube embed URL only if trailerURL exists
    const youtubeEmbedURL = movie.trailerurl ? getYouTubeEmbedURL(movie.trailerurl) : null;

    // Render the page with all the required data
    res.render("movieShowCase", {
      title: pageTitle,  // Make sure pageTitle is defined
      movie: movie,
      runtime: runtime,
      youtubeURL: youtubeEmbedURL,
      genres: capitalizedGenres
    });

  } catch(err) {
    console.error('Error fetching movie: ', err.message);
    res.status(500).send("An error occurred while fetching the movie.");
  }
}

const getYouTubeEmbedURL = (url) => {
  const videoId = url.split('v=')[1]; // Extract the video ID from the full URL
  return `https://www.youtube.com/embed/${videoId}`;
}

const calculateMovieLength = (duration) => {
  const hours = Math.floor(duration / 60);

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

async function getMovieUpdatePage(req, res) {
  try {
    const movieName = req.params.movieName.replace(/-/g, ' '); 
    const movie = await db.getMovieByName(movieName);

    res.render("updateMovie", {
      title: pageTitle,
      movie: movie
    });

  } catch (err) {
    console.error("Failed to load page: ", { err });
    res.status(500).send("an error occured while loading the page.");
  }
}

const updateMovie = [
  validateMovie, 
  async (req, res) => {
    const oldMovieName = req.params.movieName.replace(/-/g, ' '); 

    try {
      const {
        name,
        year,
        rating,
        duration,
        description,
        posterURL,
        trailerURL,
        genres
      } = req.body;

      await db.updateMovie(
        oldMovieName,
        name,
        year,
        genres,
        rating,
        duration,
        description,
        posterURL,
        trailerURL,
      );

      res.redirect(`/movies/${name.replace(/\s+/g, '-')}`);

    } catch(err) {
      console.error('Error updating movie', err.message);
      throw new Error(`Error updating movie ${err.message}`);
    }
  }
]



module.exports = {
  getHomePage,
  getMoviePage,
  getGenresPage,
  getNewMoviePage,
  addNewMovie,
  getMovieShowcasePage,
  deleteMovie,
  getMovieUpdatePage,
  updateMovie
};
