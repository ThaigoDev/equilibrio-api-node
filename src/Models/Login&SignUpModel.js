const mongoose = require("mongoose");
const validator = require('validator');
const bcryptjs = require("bcryptjs");

const SignupSchema = mongoose.Schema({
   nome: { type: String, required: true },
   email: { type: String, required: true },
   password: { type: String, required: true },
   passwordConfirmed: { type: String, required: true },
   userPhoto: { type: String, required: false },
});

const SignupModel = mongoose.model("Accounts", SignupSchema);


class SignUp {
  
   constructor(body) {
      this.body = body;
      this.errors = [];
      this.user = null;
   }
    async userExist() {
      try {
         const existUser = await SignupModel.findOne({ email: this.body.email });
         if (existUser) {
            this.errors.push("Já possui uma conta com esse E-mail!");
            return;
         }
      } catch (e) {
         throw new Error(e);
      }

   }
   validation() {
      this.cleanUP();
      if (!validator.isEmail(this.body.email)) {
         this.errors.push("E-mail incorreto !");
         return;
      };
      this.userExist();
      if (this.body.password < 3) {
         this.errors.push("Senha inválida, precistar ter no minimo 4 caraceters");
         return;
      }
      if (!bcryptjs.compare(this.body.password, this.body.passwordConfirmed)) {
         this.errors.push("Senhas não conferem !");
         return;
      }

   }
   async register() {
      const salt = bcryptjs.genSaltSync();
      this.body.password = bcryptjs.hashSync(this.body.password, salt);
      this.body.passwordConfirmed = bcryptjs.hashSync(this.body.passwordConfirmed, salt);
      this.validation();

      if (this.errors.length === 0) {
         try {
            this.user = await SignupModel.create(this.body);

         } catch (e) {
            throw new Error(e);
         }
      }
   }
   async login() {
      try {
         this.user = await SignupModel.findOne({ email: this.body.email });
         if (!this.user) {
            this.errors.push("Usuário não existe !");
            return;
         }
         if (!bcryptjs.compareSync(this.body.password, this.user.password)) {
            this.errors.push("Senha incorreta !");
            return;
         }

      } catch (e) {
         throw new Error(e);
      }
   }
    cleanUP() {
      for (let key in this.body) {
         if (typeof this.body[key] !== "string") this.body[key] = "";

      }

   }
    async updateProfile(id) {
      const profileUpdated = await SignupModel.findByIdAndUpdate(id, this.body, { new: true });
      return profileUpdated;
   }
    async getAllUsers() {
      const allUsers = await SignupModel.find();
      return allUsers;
   }
    async editPermissionsOfUser(id) {
      try {
         this.user = await SignupModel.findByIdAndUpdate(id, { office: this.body.office }, { new: true });
      } catch (e) {
         throw new Error(e);
      }
   }
    async deleteUser(id) {
      try {
         this.user = await SignupModel.findByIdAndDelete({ _id: id });
      } catch (e) {
         throw new Error(e);
      }
   }
}



exports.SignUp = SignUp;