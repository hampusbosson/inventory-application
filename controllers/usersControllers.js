const db = require("../db/queries");
const {body, validationResult} = require("express-validator");

const pageTitle = "MovieHub"

const getHomePage = (req, res) => {
    try {
        res.render("index", {
            title: pageTitle,
        });
    } catch(err) {
        console.error("Failed to load page: ", {err});
        res.status(500).send("an error occured while loading the page.")
    }
}

const getMoviePage = (req, res) => {
    try {
        res.render("movies", {
            title: pageTitle,
        })
    } catch(err) {
        console.error("Failder to load page: ", err); 
        res.status(500).send("an error occured while loading the page.")
    }
}

const getGenresPage = (req, res) => {
    try {
        res.render("genres", {
            title: pageTitle,
        })
    } catch(err) {
        console.error("Failder to load page: ", err); 
        res.status(500).send("an error occured while loading the page.")
    }
}

module.exports = {
    getHomePage,
    getMoviePage,
    getGenresPage
}



