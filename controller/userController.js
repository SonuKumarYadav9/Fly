
const userModel = require("../model/userModel");
const { uploadFile } = require("../aws/aws");
const validEmail = require("email-validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { isValidObjectId } = require("mongoose");
const saltRounds = 10; 

const isValid = function (value) {
  if (typeof value === "undefined" || value === null) return false;
  if (typeof value === "string" && value.trim().length === 0) return false;
  if (typeof value === "number") return false;
  return true;
};

const isValidImage = function (files) {
  if (files == undefined || files == "") return false;
  if (!/(\.jpg|\.jpeg|\.png|\.gif)$/i.exec(files.originalname)) return false;
  return true;
};

const nameRegex = /^[a-zA-z]+([\s][a-zA-Z]+)*$/;
const passwordRegex = /^[a-zA-Z0-9!@#$%^&*]{8,15}$/;
const mobileRegex =
  /^(?:(?:\+|0{0,2})91(\s*|[\-])?|[0]?)?([6789]\d{2}([ -]?)\d{3}([ -]?)\d{4})$/;

const registerUser = async (req, res) => {
  try {
    let data = req.body;
    if (Object.keys(data).length == 0)
      return res
        .status(400)
        .send({ status: false, message: "There is no data to register." });

    let { name, mobile, email, password } = data;

    if (!isValid(name))
      return res
        .status(400)
        .send({ status: false, message: "First name is not present." });
    if (!nameRegex.test(name))
      return res.status(400).send({
        status: false,
        message: "Last name should only contain alphabets.",
      });

    if (!isValid(email))
      return res
        .status(400)
        .send({ status: false, message: "Email address is not present." });
        
    if (!validEmail.validate(email))
      return res
        .status(400)
        .send({ status: false, message: "The email address is invalid." });
    let checkEmail = await userModel.findOne({ email });
    if (checkEmail)
      return res.status(400).send({
        status: false,
        message: "This email address is already registered.",
      });

    let files = req.files[0];
    if (!isValidImage(files))
      return res.status(400).send({
        status: false,
        message:
          "Image must be present and only jpg/jpeg/png/gif extensions are allowed.",
      });


    data.profileImage = await uploadFile(files);

    if (!isValid(mobile))
      return res
        .status(400)
        .send({ status: false, message: "mobile number is not present." })
    if (!mobileRegex.test(mobile))
      return res.status(400).send({
        status: false,
        message:
          "mobile number must contain only digits and should have length of 10.",
      });
    let checkmobile = await userModel.findOne({ mobile });
    if (checkmobile)
      return res.status(400).send({
        status: false,
        message: "This mobile number is already registered.",
      });

    if (!isValid(password))
      return res
        .status(400)
        .send({ status: false, message: "Password is not present." });
    if (!passwordRegex.test(password))
      return res.status(400).send({
        status: false,
        message: "Password should have 8 to 15 characters.",
      });

      data.password = await bcrypt.hash(password, saltRounds); 

      let profileData = await userModel.create(data);
      return res
        .status(201)
        .send({
          status: true,
          message: "User Created Successfully",
          data: profileData,
        });
    } catch (error) {
      console.log(error)
      return res.status(500).send({ status: false, message: error.message });
    }
};

const userLogin = async function (req, res) {
    try {
      let data = req.body;
      let {mobile, password } = data;
      if (Object.keys(data).length == 0)
        return res
          .status(400)
          .send({ status: false, message: "There is no data to Login." });
  
      if (!isValid(mobile))
        return res
          .status(400)
          .send({ status: false, message: "Email address should be present." });
      if (!mobileRegex.test(mobile))
        return res
          .status(400)
          .send({ status: false, message: "The email address is invalid." });
      let user = await userModel.findOne({mobile});
      if (!user)
        return res
          .status(404)
          .send({
            status: false,
            message: "This email address is not registered.",
          });
          
  
      if (!isValid(password))
        return res
          .status(400)
          .send({ status: false, message: "Password should be present." });
      if (!passwordRegex.test(password))
        return res
          .status(400)
          .send({
            status: false,
            message: "Password is invalid. It should have 8 to 15 characters.",
          });
  
      let checkPassword = await bcrypt.compare(password, user.password);
  
      if (!checkPassword)
        return res
          .status(400)
          .send({ status: false, message: "Invalid Password Credential." });
  
      const token = jwt.sign(
        {
          userId: user._id,
          iat: Math.floor(Date.now() / 1000),
          exp: Math.floor(Date.now() / 1000) + 100*60 * 60,
        },
        "secretkey"
      );
  
      res.header("Authorisation", token);
      return res.status(200).send({
        status: true,
        message: "User successfully loggedin",
        data: { userId: user._id, token: token },
      });
    } catch (error) {
      return res.status(500).send({ status: false, message: error.message });
    }
  };



  const getUser =async(req,res)=>{
    try {
      let userId = req.params.userId
      if(!isValidObjectId(userId)){return res.satus(400).json({status:flase,msg:"Please enterValid ObjectId"})}


      let user= await userModel.findOne({userId})
      if(!user){return res.status(404).send({status:false,msg:"User Not found"})}

      return res.status(200).send({status:true,data:user,msg:"user Found Success"})
    } catch (error) {
      console.log(error)
      return res.status(500).send({ status: false, message: error.message });
    }
  }


  const updateUser = async (req,res)=>{

 try {
  const { userId } = req.params;

  if (!isValidObjectId(userId)) {
    return res
      .status(400)
      .send({ status: false, message: "Please provide valid ID" });
  }
  const data = req.body;
  const files = req.files;
  const { password } = data;
  const updateUserData = {};

  const isUserExist = await userModel.findById(userId);
  if (isUserExist.isDeleted == true)
  return res
    .status(404)
    .send({
      status: false,
      message: "The user not found or already deleted.",
    });
  if (data._id) {
    return res
      .status(400)
      .send({ status: false, message: "can not update user id" });
  } 
  if (data.name) {
    if (!isValid(data.name)) {
      return res
        .status(400)
        .send({ status: false, message: "please provide valid  name" });
    }
    updateUserData.name = data.name;
  }
  if (data.email) {
    if (!validEmail.validate(data.email)) {
      return res
        .status(400)
        .send({ status: false, message: "Please provide valid email Id" });
    }
    const isEmailInUse = await userModel.findOne({ email: data.email });
    if (isEmailInUse) {
      return res.status(400).send({
        status: false,
        message: "email already registered, enter different email",
      });
    }
    updateUserData.email = data.email;
  }
  if (data.mobile) {
    if (!mobileRegex.test(data.mobile)) {
      return res.status(400).send({
        status: false,
        message:
          "Please provide 10 digit number && number should start with 6,7,8,9",
      });
    }
    const ismobileInUse = await userModel.findOne({ mobile: data.mobile });
    if (ismobileInUse) {
      return res.status(400).send({
        status: false,
        message: "mobile number already registered, enter different number",
      });
    }
    updateUserData.mobile = data.mobile;
  }
  //it check image avilable or not
  if (files && files.length > 0) {
    const link = await uploadFile(files[0]);
    updateUserData.profileImage = link;
  }
  if (password) {
    const hash = await bcrypt.hash(password, saltRounds);  //
    updateUserData.password = hash;
  };
  const updateUser = await userModel.findOneAndUpdate(
    { _id: userId },
    updateUserData,
    { new: true }
  );
  return res.status(200).send({
    status: true,
    message: "User profile update successfully",
    data: updateUser,
  });
 } catch (error) {
  console.log(error)
  return res.status(500).send({ status: false, message: error.message });
}
  }





  const deleteUser = async (req,res)=>{
   try{
    let userId=req.params.userId

    // if(isValidObjectId(userId)){return res.status(400).send({status:false,msg:"Invalid UserId"})}

    let isDeletedUser=await userModel.findById(userId)
    if (isDeletedUser.isDeleted == true)
      return res
        .status(404)
        .send({
          status: false,
          message: "The user not found or already deleted.",
        });

    let deletedUser= await userModel
      .findByIdAndUpdate(
        { _id: userId },
        { $set: { isDeleted: true} },
        { new: true }
      )
      .select({ _id: 1, name: 1, isDeleted: 1 });

    res
      .status(200)
      .send({
        status: true,
        message: "User deleted successfullly.",
        data: deletedUser,
      });
    
    }catch (error) {
        return res.status(500).send({ status: false, message: error.message });
      }
  }
 



  const forgetPass= async (req,res)=>{
    try {
      
    } catch (error) {
      
    }
  }


module.exports={registerUser,userLogin,getUser,updateUser,deleteUser}

