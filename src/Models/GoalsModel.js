const  mongoose = require('mongoose');  

const GoalSchema = new mongoose.Schema({
  waterCups: { type: Number, default: 8 },
  exerciseMinutes: { type: Number, default: 60 },
  sleepMinutes: { type: Number, default: 60 },
  weight: { type: Number, default: 70 },
  streakDays: { type: Number, default: 7 }
}, { _id: false }); 


module.exports = GoalSchema;