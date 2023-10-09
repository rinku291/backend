const mongoose = require('mongoose');

const ProSchema = mongoose.Schema(
    {
        title :{type:String},
        image :{type:String},
        description :{type:String},
        category_id :{type:String},
        price :{type:Number},
        star_rating :{type:String},
        ratings_reviews :{type:String},
        special_discount :{type:Number},
        available_offers :{type:String},
        product_features :{type:String},
        tax_percentage :{type:Number},
        basic_unit :{type:Number},
	    total_quantity :{type:Number},
        quantity_sold :{type:Number},
        limited :{type:Number},
        active_for_sale :{type:Number},
        in_stock :{type:Number},
        product_id :{type:Number}
},
{
    timestamps:true
}
);

const ProductModel = mongoose.model('products',ProSchema);

module.exports = ProductModel;