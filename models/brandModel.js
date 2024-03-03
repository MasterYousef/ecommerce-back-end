const mongoose = require('mongoose')
const { imageModelOptions } = require('../middlewares/ImageMidleware')

const brandOption = mongoose.Schema({
    name:{
        type:String,
        required:[true,'name is required'],
        unique:[true,'name must be unique'],
        minlenght:[2,'too short brand name'],
        maxlenght:[25,'the long brand name']
    },
    slug:{
        type:String,
        lowercase:true
    },
    image:{
        type:String,
        required:[true,'brand Image is required'],
    }
},{timestamps:true})
imageModelOptions(brandOption,'brands')

const brand = mongoose.model('brand',brandOption)

module.exports = brand

