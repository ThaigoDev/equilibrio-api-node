const express = require('express'); 
const router = express.Router();  
const HomeController = require("../Controllers/HomeController")
const LoginAndSignUpController = require("../Controllers/Login&SignUpController")

router.get("/", HomeController.index)  
router.post("/api/auth/register", LoginAndSignUpController.createAccount);
router.post("/api/auth/login", LoginAndSignUpController.login);
router.post("/api/auth/me", LoginAndSignUpController.login);

module.exports = router

