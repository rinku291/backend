const mongoose = require('mongoose');

const UserSchema = mongoose.Schema({
    user: {type: String},
    email: {type: String},
    password:{type:String},
    mobile:{type:Number},
    OTP:{type:Number},
    status:{type:Number, default:0}
})


const UserModel = mongoose.model('user',UserSchema);

module.exports = UserModel;