const mongoose = require('mongoose');

const Schema = mongoose.Schema(
    {
        name: { type: String },
        mobile: { type: Number },
        pincode: { type: Number },
        locality: { type: String },
        area_street: { type: String },
        city_district: { type: String },
        state: { type: String },
        landmark: { type: String },
        alt_phone: { type: Number },
        address_type: { type: String },
        order_details: {type: Array},
        tot_count: {type:Number},
        fin_price: {type:String},
        user_id: {type:String},
        payment_id: {type:String}
    },
    {
        timestamps:true
    }
);

const OrderModel = mongoose.model('order_detail',Schema);

module.exports = OrderModel;