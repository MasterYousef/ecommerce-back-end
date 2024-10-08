const mongoose = require('mongoose');

const orderOptins = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'user',
      required: [true, 'Order must be belong to user'],
    },
    cartItems: [
      {
        product: {
          type: mongoose.Schema.ObjectId,
          ref: 'product',
        },
        quantity: Number,
        color: String,
        price: Number,
      },
    ],
    taxPrice: {
      type: Number,
      default: 0,
    },
    shippingAddress: {
        details: String,
        city: String,
        postalCode: String,
    },
    shippingPrice: {
      type: Number,
      default: 0,
    },
    totalOrderPrice: {
      type: Number,
    },
    paymentMethodType: {
      type: String,
      enum: ['card', 'cash'],
      default: 'cash',
    },
    isPaid: {
      type: Boolean,
      default: false,
    },
    paidAt: Date,
    isDelivered: {
      type: Boolean,
      default: false,
    },
    deliveredAt: Date,
  },
  { timestamps: true }
);

orderOptins.pre(/^find/, function (next) {
  this.populate({
    path: 'user',
    select: 'name image email phone',
  }).populate({
    path: 'cartItems.product',
    select: 'title imageCover ratingsQuantity ratingsAverage',
  }).populate({
    path: 'shippingAddress',
  });
  next();
});

module.exports = mongoose.model('order', orderOptins);
