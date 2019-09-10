const mongoose = require('mongoose')

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  type: {
    type: String,
    required: true
  },
  brand: {
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Brand',
    required: true,
  },
  stock: {
    type: Number,
    required: true
  },
  condition: {
    type: String,
    required: true
  },
  image: {
    type: String,
    required: true
  },
  productDescription: {
    type: String,
    required: true
  },
  tags: {
    type: String,
    required: true
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
})


const cartSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  productId: {
    type: [productSchema],
    ref: 'Product',
    required: true
  }
      
})

const Product = mongoose.model('Product', productSchema)
const Cart = mongoose.model('Cart', cartSchema)

module.exports = { Product, Cart }
