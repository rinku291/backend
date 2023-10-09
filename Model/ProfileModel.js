const mongoose = require('mongoose');

const ProSchema = mongoose.Schema({
    fname: { type: String },
    lname: { type: String },
    gender: { type: String },
    email: { type: String },
    mobile: { type: Number },
    pancard: { type: String },
    name_add:{ type: String },
    mobile_add:{ type: Number },
    pincode:{ type: String },
    locality:{ type: String },
    area_street:{ type: String },
    state:{ type: String },
    landmark:{ type: String },
    alt_phone:{ type: Number },
    address_type:{ type: String },
    user_id: { type:String, ref: "users" } 
},
{
    tiemstamps:true
});

const ProfileModel = mongoose.model('profile', ProSchema);

module.exports = ProfileModel;

