const express = require('express'); 
const router = express.Router();  
const HomeController = require("../Controllers/HomeController")
const LoginAndSignUpController = require("../Controllers/Login&SignUpController")

router.get("/", HomeController.index)  
router.post("/signup", LoginAndSignUpController.createAccount);
router.post("/login", LoginAndSignUpController.login);


module.exports = router

