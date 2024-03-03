const mongoose = require('mongoose')


const couponOption = mongoose.Schema({
    name:{
        type:String,
        required:[true,'coupon name is required'],
        unique:[true,'coupon name must be unique'],
        minlenght:[5,'too short coupon name'],
        maxlenght:[30,'the long coupon name']
    },
    discount:{
        type:Number,
        required:[true,'coupon discount is required'],
    },
    expire:{
        type:Date,
        required:[true,'coupon expire data is required']
    },

},{timestamps:true})
const couponModel = mongoose.model('coupon',couponOption)

module.exports = couponModel