const mongoose = require('mongoose')

const subCategoryOption = mongoose.Schema({
    name:{
        type:String,
        required:[true,'name is required'],
        unique:[true,'name must be unique'],
        minlenght:[3,'too short subCategory name'],
        maxlenght:[25,'the long subCategory name'],
        trim:true
    },
    slug:{
        type:String,
        lowercase:true
    },
    category:{
        type:mongoose.Schema.ObjectId,
        ref:'category',
        required:[true,'category is required'],
    }
},{timestamps:true})
const subCategory = mongoose.model('subCategory',subCategoryOption)

module.exports = subCategory