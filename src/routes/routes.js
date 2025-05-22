const express = require('express'); 
const router = express.Router();  
const HomeController = require("../Controllers/HomeController")
const LoginAndSignUpController = require("../Controllers/Login&SignUpController")

router.get("/", HomeController.index)  
router.post("/api/auth/register", LoginAndSignUpController.createAccount);
router.post("/api/auth/login", LoginAndSignUpController.login);
router.get("/api/auth/me", LoginAndSignUpController.me);

module.exports = router

