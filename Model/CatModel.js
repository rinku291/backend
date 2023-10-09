const mongoose = require('mongoose');

const CatSchema = mongoose.Schema(
    {
        parent_id: { type: String },
        category_name: { type: String },
        category_image: { type: String },
        cat_desc: { type: String },
        header_value : {
            type : Boolean,
            default : false
        }
    },
    {
    
        timestamps: true

    });

const CatModel = mongoose.model('categories', CatSchema);


module.exports = CatModel;