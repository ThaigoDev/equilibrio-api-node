const express = require('express'); 
const router = express.Router();  
const HomeController = require("../Controllers/HomeController")
const LoginAndSignUpController = require("../Controllers/Login&SignUpController"); 
const DailyEntryController = require("../Controllers/DailyEntryController")

router.get("/", HomeController.index) 
router.get("/mostrarDadosPessoais",(req,res)=>{
   res.send("Olá, Thiago",req)
})  
router.post("/api/auth/register", LoginAndSignUpController.createAccount);
router.post("/api/auth/login", LoginAndSignUpController.login);
router.get("/api/auth/me", LoginAndSignUpController.me);
router.post("/api/daily-entry/create",DailyEntryController.submitDailyEntry);
router.get("/api/daily-entry/mydailyEntries",DailyEntryController.getDailyEntries);  
router.post("/api/daily-entry/update/:id",DailyEntryController.updateA);
module.exports = router

