const { SignUp } = require("../Models/Login&SignUpModel");

class LoginAndSignUpController {
  static async createAccount(req, res) {
    try {
      const singUp = new SignUp(req.body);
      await singUp.register();
      if (singUp.errors.length > 0) {
        res.status(400).json({
          errors: singUp.errors
        })

      } else {
        res.status(201).json({
          status: "success",
          message: "A new Account has been Created!",
          user: req.session.user
        })
      }
    } catch (e) {
      res.status(500).json({
        status: "failed",
        message: "Internal server error",
        error: e.message
      }
      )
    }

  }
  static async login(req, res) {
    try {
      if (req.session.user) {
        res.status(200).json({
          status: "success",
          user: req.session.user
        })
      }
      const singup = new SignUp(req.body);
      await singup.login();
      if (singup.errors.length > 0) {
        res.json({
          errors: singup.errors
        })
      } else {
        req.session.user = singup.user;
        return res.json({
          status: "sucess",
          profile: req.session.user,
        })
      }
    } catch (e) {
      res.status(500).json({
        status: "failed",
        message: "Internal server error",
        error: e.message
      }
      )
    }
  }
  static async allUsers(req, res) {
    try {
      if (req.session.user) {
        return res.json({
          status: "sucess",
          profile: req.session.user,
        })
      }

    } catch (e) {
      res.status(500).json({
        status: "failed",
        message: "Internal server error",
        error: e.message
      }
      )
    }
  }
}

module.exports = LoginAndSignUpController; 