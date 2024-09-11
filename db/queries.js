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

module.exports = {
  insertMovie,
};