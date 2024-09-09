const { Router } = require("express");
const usersController = require("../controllers/usersControllers");
const userRouter = Router();

userRouter.get("/", usersController.getHomePage);


