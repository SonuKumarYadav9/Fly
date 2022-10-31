const express = require("express");
const userController = require("../controller/userController");
// const userController2 = require("../controller/user");

const router = express.Router();

let { registerUser,userLogin,getUser,updateUser,deleteUser} = userController;
// let { signUp } = ?userController2;



// router.post("/signup",signUp);
router.post("/register", registerUser);
router.post("/login", userLogin);
router.get("/user/:userId", getUser);
router.put("/updateUser/:userId", updateUser);
router.delete("/deleteUser/:userId", deleteUser);




router.all("/*", async function (req, res) {
    res.status(404).send({ status: false, msg: "Page Not Found!" });
  });
  

module.exports = router;


















