const mongoose = require('mongoose')
// const uniqueValidator = require('mongoose-unique-validator');

const brandSchema = new mongoose.Schema({
    name: { type: String, 
        required: true,
         unique: true },
image:{
    type:String,
    required:true
}
})



brandSchema.virtual('products', {
    ref: 'Product',
    localField: '_id',
    foreignField: 'brand'
  });

  
//   brandSchema.plugin(uniqueValidator);


const Brand = mongoose.model('Brand', brandSchema);

module.exports = Brand
