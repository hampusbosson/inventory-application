const { Router } = require("express");
const usersController = require("../controllers/usersControllers");
const userRouter = Router();

userRouter.get("/", usersController.getHomePage);
userRouter.get("/movies", usersController.getMoviePage);
userRouter.get("/genres", usersController.getGenresPage);
userRouter.get("/movies/new", usersController.getNewMoviePage);
userRouter.post("/movies/new", usersController.addNewMovie);
userRouter.get("/movies/:movieName", usersController.getMovieShowcasePage);
userRouter.post("/movies/:movieName/delete", usersController.deleteMovie);
userRouter.get("/movies/:movieName/update", usersController.getMovieUpdatePage);
userRouter.post("/movies/:movieName/update", usersController.updateMovie);


module.exports = userRouter; 


