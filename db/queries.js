const { query } = require("./pool");

async function insertMovie(
  name,
  year,
  genres,
  rating,
  duration,
  description,
  posterURL,
  trailerURL,
) {

  const movieInsertQuery = `
    INSERT INTO movies (name, releaseyear, rating, duration, description, posterURL, trailerURL)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING id;
  `;

  const movieValues = [
    name,
    year,
    rating,
    duration,
    description,
    posterURL,
    trailerURL
  ];

  try {
    // Execute the query and return the new movie's ID
    const result = await query(movieInsertQuery, movieValues);
    const movieId = result.rows[0].id;
    console.log('Movie inserted successfully with ID:', movieId);

    // Insert genres
    if (Array.isArray(genres)) {
      for (const genreId of genres) {
        await insertMovieGenre(movieId, genreId);
      }
    } else {
      await insertMovieGenre(movieId, genres);
    }

    // Return movie ID for further use
    return movieId;

  } catch (err) {
    console.error('Error inserting movie:', err.message);
    throw new Error(`Error inserting movie: ${err.message}`);
  }
}

async function getGenreIdByName(genreName) {
  const genreQuery = `SELECT id FROM genres WHERE name = $1;`;
  const result = await query(genreQuery, [genreName]);

  if (result.rows.length === 0) {
      throw new Error(`Genre "${genreName}" not found`);
  }
  
  return result.rows[0].id;
}

// Helper function to insert movie genres
async function insertMovieGenre(movieId, genreName) {
  try {
      // First, get the genre ID based on the genre name
      const genreId = await getGenreIdByName(genreName);

      // Then insert into movie_genres
      const genreInsertQuery = `
          INSERT INTO movie_genres (movie_id, genre_id)
          VALUES ($1, $2);
      `;
      await query(genreInsertQuery, [movieId, genreId]);

      console.log(`Genre ${genreName} (ID: ${genreId}) added to movie ${movieId}`);
  } catch (err) {
      console.error('Error inserting genre:', err.message);
      throw new Error(`Error inserting genre: ${err.message}`);
  }
}

async function getAllMovies() {
  const getAllMoviesQuery = `
  SELECT * FROM movies;
  `
  try {
    const result = await query(getAllMoviesQuery);

    return result.rows;
  } catch(err) {
    console.error('Error getting movies:', err.message);
    throw new Error(`Error getting movies: ${err.message}`);
  }
}

async function getAllGenres() {
  const getAllGenresQuery = `
  SELECT * FROM genres;
  `
  try {
    const result = await query(getAllGenresQuery);

    return result.rows;
  } catch(err) {
    console.error('Error getting genres:', err.message);
    throw new Error(`Error getting genres: ${err.message}`);
  }
}

async function getMovieByName(movieName) {
  const getMovieQuery = `
    SELECT * FROM movies WHERE LOWER(name) = $1;
  `;

  try {
    const result = await query(getMovieQuery, [movieName.toLowerCase()]);
    return result.rows[0];
  } catch(err) {
    console.error('Error fetching movie: ', err.message); 
    throw new Error(`Error fetching movie: ${err.message}`);
  }
}

async function getGenresForMovie(movieName) {
  const getGenresQuery = `
  SELECT g.name 
  FROM genres G
  JOIN movie_genres mg ON g.id = mg.genre_id
  JOIN movies m ON mg.movie_id = m.id
  WHERE LOWER (m.name) = $1; 
  `;

  try {
    const result = await query(getGenresQuery, [movieName.toLowerCase()]);
    return result.rows.map(row => row.name);
  } catch (err) {
    console.error('Error fetching genres: ', err.message);
    throw new Error(`Error fetching genres: ${err.message}`);
  }
}

async function deleteMovie(movieName) {
  const deleteMovieQuery = `
    DELETE FROM movies 
    WHERE LOWER(name) = $1;
  `;

  try {
    const result = await query(deleteMovieQuery, [movieName.toLowerCase()]);
    return result.rowCount > 0;
  } catch(err) {
    console.error('Error deleting movie: ', err.message);
    throw new Error(`Error deleting movie: ${err.message}`);
  }
}



module.exports = {
  insertMovie,
  getAllMovies,
  getAllGenres,
  getMovieByName,
  getGenresForMovie,
  deleteMovie
};