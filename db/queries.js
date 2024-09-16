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

    return result.rows.map(row => row.name.charAt(0).toUpperCase() + row.name.slice(1));
    
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

async function getMoviesForGenre(genreName) {
  const getMoviesQuery = `
  SELECT m.name
  FROM movies m
  JOIN movie_genres mg ON m.id = mg.movie_id
  JOIN genres g ON mg.genre_id = g.id
  WHERE LOWER (g.name) = $1;
  `

  try {
    const result = await query(getMoviesQuery, [genreName.toLowerCase()]);
    return result.rows;
  } catch (err) {
    console.error('Error fetching movies: ', err.message);
    throw new Error(`Error fetching movies: ${err.message}`);
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

async function updateMovieGenres(movieId, genres) {
  const deleteGenresQuery = `
    DELETE FROM movie_genres
    WHERE movie_id = $1;
  `;

  const insertGenreQuery = `
    INSERT INTO movie_genres (movie_id, genre_id)
    VALUES ($1, $2);
  `;

  try {
    // Delete old genres
    await query(deleteGenresQuery, [movieId]);

    if (genres.length === 0) {
      return;
    }

    // Insert new genres by fetching their IDs
    for (const genreName of genres) {
      const genreId = await getGenreIdByName(genreName);
      if (genreId) {
        await query(insertGenreQuery, [movieId, genreId]);
      } else {
        console.error(`Genre "${genreName}" not found`);
      }
    }
  } catch (err) {
    console.error('Error updating genres: ', err.message);
    throw new Error(`Error updating genres: ${err.message}`);
  }
}

async function updateMovie(
  movieName, 
  name,
  year,
  genres,
  rating,
  duration,
  description,
  posterURL,
  trailerURL
) {
  const movie = await getMovieByName(movieName);

  if (!movie) {
    throw new Error('Movie not found');
  }
  
  const updateMovieQuery = `
    UPDATE movies
    SET 
      name = $1,
      releaseyear = $2,
      rating = $3,
      duration = $4,
      description = $5,
      posterURL = $6,
      trailerURL = $7
    WHERE LOWER(name) = $8
    RETURNING *;
  `;

  const movieValues = [
    name,
    year,
    rating,
    duration,
    description,
    posterURL,
    trailerURL,
    movieName.toLowerCase()
  ];

  try {
    const result = await query(updateMovieQuery, movieValues);
    const updatedMovie = result.rows[0];

    await updateMovieGenres(updatedMovie.id, genres); // Add 'await' here

    return updatedMovie;
  } catch (err) {
    console.error('Error updating movie: ', err.message);
    throw new Error(`Error updating movie: ${err.message}`);
  }
}



module.exports = {
  insertMovie,
  getAllMovies,
  getAllGenres,
  getMovieByName,
  getGenresForMovie,
  deleteMovie,
  updateMovie,
  getMoviesForGenre
};