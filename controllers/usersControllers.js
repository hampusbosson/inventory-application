const db = require("../db/queries");
const {body, validationResult} = require("express-validator");

const getHomePage = (req, res) => {
    try {
        res.render("index");
    } catch(err) {
        console.error("Failed to load page: ", {err});
        res.status(500).send("an error occured while loading the page.")
    }
}




