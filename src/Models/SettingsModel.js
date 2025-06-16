const mongoose  = require('mongoose')  
const GoalSchema = require('../Models/GoalsModel')
const SettingsSchema = new mongoose.Schema({
   goals: GoalSchema,
   notifyEnabled: { type: Boolean, default: false },
   notifyHour: { type: String, default: "20:00" },
 }, { _id: false }); 

 
 module.exports = SettingsSchema