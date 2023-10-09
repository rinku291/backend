const mongoose = require('mongoose');


const CartSchema = mongoose.Schema(
    {
    product_id:{type:String,ref: "products"},
    count:{type:Number},
    user_id:{type:String},
    status:{type:Boolean},
    },
    {
        timestamps:true
    }
);

const CartModel = mongoose.model('cart',CartSchema)

module.exports = CartModel;