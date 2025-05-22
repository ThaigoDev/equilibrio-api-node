const mongoose = require('mongoose');

const DailyEntrySchema = new mongoose.Schema(
  {
    user: {                                      // referência ao User
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Accounts',
      required: true,
      index: true
    },
    date: { type: Date, required: true },        // YYYY-MM-DD
    mood: {                                      // 5 opções de emoji
      type: String,
      enum: ['very_happy', 'happy', 'neutral', 'sad', 'very_sad'],
      required: true
    },
    note:      { type: String, maxlength: 500 },
    habits: {
      waterCups:       { type: Number, min: 0 },
      exerciseMinutes: { type: Number, min: 0 },
      sleepMinutes:    { type: Number, min: 0 },
      weight:          { type: Number, min: 0 }
    },
    streakCount: { type: Number, default: 0 }
  },
  { timestamps: true }
);

DailyEntrySchema.index({ user: 1, date: 1 }, { unique: true }); // 1 entry/dia 

const DailyEntryModel = mongoose.model('DailyEntry', DailyEntrySchema);

class DailyEntry {
   constructor(body) { 
      this.body = body; 
      this.errors = [];
      this.dailyEntry = null;
   } 

   async metGoals(body) {
      return(
         body.habits.waterCups >= 8 &&
         body.habits.exerciseMinutes >= 30&&
         body.habits.sleepMinutes >= 420
      ) 
      
   } 
   
}