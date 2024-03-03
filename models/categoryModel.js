const mongoose = require('mongoose')
const { imageModelOptions } = require('../middlewares/ImageMidleware')

const categoryOption = mongoose.Schema({
    name:{
        type:String,
        required:[true,'name is required'],
        unique:[true,'name must be unique'],
        minlenght:[3,'too short category name'],
        maxlenght:[25,'the long category name']
    },
    slug:{
        type:String,
        lowercase:true
    },
    image:{
        type:String,
        required:[true,'Category Image is required'],
    }
},{timestamps:true})
imageModelOptions(categoryOption,'categories')
const category = mongoose.model('category',categoryOption)

module.exports = category