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
    note: { type: String, maxlength: 500 },
    habits: {
      waterCups: { type: Number, min: 0 },
      exerciseMinutes: { type: Number, min: 0 },
      sleepMinutes: { type: Number, min: 0 },
      weight: { type: Number, min: 0 }
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
    this.erros = [];
    this.dailyEntry = null;

  }
  async metGoals() {
    return (
      this.body.habits.waterCups >= 8 &&
      this.body.habits.exerciseMinutes >= 30 &&
      this.body.habits.sleepMinutes >= 420 // 7 horas
    );

  }
  async updateEntry() {
    try {
      const userId = this.body.userId;
      const today = new Date().toISOString().split('T')[0];
      const date = new Date(today);

      const { mood, note, habits } = this.body;
      let existingEntry = await DailyEntryModel.findOne({ user: userId, date });
      if (existingEntry) {
        existingEntry.mood = mood;
        existingEntry.note = note;
        existingEntry.habits = habits;
        this.dailyEntry = await DailyEntryModel.findByIdAndUpdate({ user: userId, mood: existingEntry.mood, note: existingEntry.note, habits: existingEntry.habits })
      }


    } catch (e) {
      throw new Error(e);
    }
  }
  async spreakCalculator() {
    const userId = this.body.userId;
    const today = new Date().toISOString().split('T')[0];
    const date = new Date(today);

    const { mood, note, habits } = this.body;
    const yesterday = new Date(date);
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);

    const yesterdayEntry = await DailyEntryModel.findOne({ user: userId, date: yesterday });

    let streak = 1;
    if (yesterdayEntry && this.metGoals(yesterdayEntry.habits)) {
      streak = yesterdayEntry.streakCount + 1; 
      this.dailyEntry = await DailyEntryModel.findByIdAndUpdate({ user: userId, streakCount: streak }); 
    }
  }
  async createEntry() { 
      const userId = this.body.userId;
      const today = new Date().toISOString().split('T')[0];
      const date = new Date(today);

      const { mood, note, habits } = this.body;
    try{
      this.dailyEntry = await DailyEntry.create(this.body); 

    }catch(e) {
      throw new Error(e); 
    }
  }
} 
module.exports = DailyEntry; 