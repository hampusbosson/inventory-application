const { query } = require('./pool');

async function createTables() {
    try {
        const createMovieTable = `
            CREATE TABLE IF NOT EXISTS movies (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                rating DECIMAL(3, 2) CHECK (rating >= 0 AND rating <= 10),
                releaseDate DATE NOT NULL,
                description TEXT,
                posterURL TEXT,
                trailerURL TEXT, 
                duration INT CHECK (duration > 0)
            );
        `;

        const createGenresTable = `
            CREATE TABLE IF NOT EXISTS genres (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL
            );
        `;

        const createMovieGenresTable = `
            CREATE TABLE IF NOT EXISTS movie_genres (
                movie_id INT REFERENCES movies(id) ON DELETE CASCADE,
                genre_id INT REFERENCES genres(id) ON DELETE CASCADE,
                PRIMARY KEY (movie_id, genre_id)
            );
        `;

        await query(createMovieTable); 
        await query(createGenresTable);
        await query(createMovieGenresTable);

    } catch (err) {
        console.error("Error creating tables: ", err);
    }
}

createTables();