const { Router } = require("express");
const usersController = require("../controllers/usersControllers");
const userRouter = Router();

userRouter.get("/", usersController.getHomePage);
userRouter.get("/movies", usersController.getMoviePage);
userRouter.get("/genres", usersController.getGenresPage);
userRouter.get("/movies/new", usersController.getNewMoviePage);

module.exports = userRouter; 


