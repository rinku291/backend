const mongoose = require('mongoose');

const CatSchema = mongoose.Schema(
    {
            subcat_title: {type:String},
            subcat_img: {type:String},
            subcat_price: {type:String},
            subcat_desc:{type:String},
            subcat_id: { type: String}
       
           
 
    },
     
    {
        timestamps: true

    });


const SubCatModel = mongoose.model('subcategories', CatSchema);

module.exports = SubCatModel;