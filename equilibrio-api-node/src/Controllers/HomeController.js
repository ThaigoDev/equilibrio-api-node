
 class HomeController  {
 static async index(req,res){
   try {
      res.status(201).json({
         status: "success", 
         message:'Bem-vindo a API do APP Equilibrio'
      })
   }catch(e) {
      res.status(500).json({
         status: "failed",
         message: "Internal server error",
         error: e.message,
       });
   }
 }
} 

module.exports = HomeController