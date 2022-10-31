// const userModel = require("../model/userModel");
// const { uploadFile } = require("../aws/aws");
// const validEmail = require("email-validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const _ = require("lodash");
const axios = require("axios");
const otpGenerator = require("otp-generator");

const { User } = require("../model/userM");
const { Otp } = require("../model/otp.js");

const signUp = async (req, res) => {
  try {
    const number = req.body.number
    const user = await User.findOne({number});
    if (user)
      return res
        .status(400)
        .send({ status: false, msg: "user Already Registered" });
    const OTP=otpGenerator.generate(6,{
        digits:true,alphabets:false,uppercase:false, specialChars:false
    })

    console.log(OTP)

    const otp=new Otp({number:number,otp:OTP});

    const salt=await bcrypt.genSalt(10)
    otp.otp=await bcrypt.hash(otp.otp, salt)
  const result=await otp.save
  return res.status(200).send({status:true,msg:"otp send Succesfully"})
    } catch (error) {
        console.log(error)
        return res.status(500).send({status:false,msg:error.message})
    }
};

module.exports={signUp}