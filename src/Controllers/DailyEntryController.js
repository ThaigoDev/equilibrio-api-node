const DailyEntryModel = require("../Models/DailyEntryModel")
class DailyEntryController {
   static async create(req,res){ 
      try {
         const DailyEntry = new DailyEntryModel(req.body) 
          await DailyEntry.createEntry(); 
         res.status(200).json(DailyEntry.dailyEntry)

      }catch(e) {
          res.status(500).json({
         status: "failed",
         message: "Internal server error",
         error: e.message,
       });
      }
   }
} 
 module.exports  = DailyEntryController; 