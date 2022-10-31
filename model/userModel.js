const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    profileImage: {
      type: String,
      required: true,
    }, // s3 link
    mobile: {
      type: Number,
      required: true,
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      min: 8,
      max: 15,
    },
    // otp:{
    //   type:String
    // }
    isDeleted:{
      type:Boolean,
      default:false
    }
   
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema); //users

// const mongoose = require("mongoose");

// const userSchema = new mongoose.Schema(
//   {
//     number: {
//       type: String,
//       required: true
//     }
   
//   },
//   { timestamps: true }
// );

// module.exports = mongoose.model("User", userSchema);