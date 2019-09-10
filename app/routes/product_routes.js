// Express docs: http://expressjs.com/en/api.html
const express = require('express')
// Passport docs: http://www.passportjs.org/docs/
const passport = require('passport')

// pull in Mongoose model for product
const { Product } = require('../models/product')

const  Brand  = require('../models/brand')


// this is a collection of methods that help us detect situations when we need
// to throw a custom error
const customErrors = require('../../lib/custom_errors')

// we'll use this function to send 404 when non-existant document is requested
const handle404 = customErrors.handle404
// we'll use this function to send 401 when a user tries to modify a resource
// that's owned by someone else
const requireOwnership = customErrors.requireOwnership

// this is middleware that will remove blank fields from `req.body`, e.g.
// { product: { title: '', text: 'foo' } } -> { product: { text: 'foo' } }
const removeBlanks = require('../../lib/remove_blank_fields')
// passing this as a second argument to `router.<verb>` will make it
// so that a token MUST be passed for that route to be available
// it will also set `req.user`
const requireToken = passport.authenticate('bearer', { session: false })

// instantiate a router (mini app that only handles routes)
const router = express.Router()

// INDEX
// GET /products
router.get('/products', (req, res, next) => {
  
  // Option 1 get user's products
  Product.find({})
    .then(products => res.status(200).json({products: products}))
    .catch(next)
  
  // // Option 2 get user's products
  // // must import User model and User model must have virtual for products
  // User.findById(req.user.id) 
    // .populate('products')
    // .then(user => res.status(200).json({ products: user.products }))
    // .catch(next)
})

//GET /Brands
router.get('/brands', (req, res, next) => {
  
  // Option 1 get user's products
  // const { brand } = req.query;
  // const brandOrAll = brand ? { brand } : {};
  Brand.find({}).populate('products')
    .then(brands => { console.log(brands.products); res.status(200).json({brands: brands})})
    .catch(next)
  
  // // Option 2 get user's products
  // // must import User model and User model must have virtual for products
  // User.findById(req.user.id) 
    // .populate('products')
    // .then(user => res.status(200).json({ products: user.products }))
    // .catch(next)
})
router.get('/brands/:brand_id/products', (req, res, next) => {
  
  // Option 1 get user's products
  // const { brand } = req.query;
  // const brandOrAll = brand ? { brand } : {};
  Product.find({brand: req.params.brand_id})
    .then(products => res.status(200).json({products}))
    .catch(next)
  
  // // Option 2 get user's products
  // // must import User model and User model must have virtual for products
  // User.findById(req.user.id) 
    // .populate('products')
    // .then(user => res.status(200).json({ products: user.products }))
    // .catch(next)
})



// SHOW
// GET /products/5a7db6c74d55bc51bdf39793
router.get('/products/:id', requireToken, (req, res, next) => {
  // req.params.id will be set based on the `:id` in the route
  Product.findById(req.params.id)
    .then(handle404)
    // if `findById` is succesful, respond with 200 and "product" JSON
    .then(product => {
      // pass the `req` object and the Mongoose record to `requireOwnership`
      // it will throw an error if the current user isn't the owner
      requireOwnership(req, product)
    
      res.status(200).json({ product: product.toObject() })
    })
    // if an error occurs, pass it to the handler
    .catch(next)
})

// CREATE
// POST /products
router.post('/products', requireToken, (req, res, next) => {
  // set owner of new product to be current user
  req.body.product.owner = req.user.id
  Product.create(req.body.product)
    // respond to succesful `create` with status 201 and JSON of new "product"
    .then(product => {
      res.status(201).json({ product: product.toObject() })
    })
    // if an error occurs, pass it off to our error handler
    // the error handler needs the error message and the `res` object so that it
    // can send an error message back to the client
    .catch(next)
})


// Post Brands 

router.post('/brands', (req, res, next) => {
  
 Brand.find({name: req.body.brand.name}).then(brands => {
   if (brands.length === 0){
     // Create
     Brand.create(req.body.brand)
       // respond to succesful `create` with status 201 and JSON of new "product"
       .then(brand => {
         res.status(201).json({ brand: brand.toObject() })
       })
       // if an error occurs, pass it off to our error handler
       // the error handler needs the error message and the `res` object so that it
       // can send an error message back to the client
       .catch(next)
   }else{
     //Errrrrr
     res.status(401).json({Error: "This brand alredy exsist"})
   }
 })
 
  //
})

router.get('/brands/:id', (req,res,next) => {
  Brand.findById(req.params.id)
  .then(handle404)
  // if `findById` is succesful, respond with 200 and "product" JSON
  .then(brand => {

    res.status(200).json({ brand: brand.toObject() })
  })
  // if an error occurs, pass it to the handler
  .catch(next)
    
  })


// UPDATE
// PATCH /products/5a7db6c74d55bc51bdf39793
router.patch('/products/:id', requireToken, removeBlanks, (req, res, next) => {
  // if the client attempts to change the `owner` property by including a new
  // owner, prevent that by deleting that key/value pair
  delete req.body.product.owner

  Product.findById(req.params.id)
    .then(handle404)
    .then(product => {
      // pass the `req` object and the Mongoose record to `requireOwnership`
      // it will throw an error if the current user isn't the owner
      requireOwnership(req, product)

      // pass the result of Mongoose's `.update` to the next `.then`
      return product.update(req.body.product)
    })
    // if that succeeded, return 204 and no JSON
    .then(() => res.status(204))
    // if an error occurs, pass it to the handler
    .catch(next)
})

// DESTROY
// DELETE /products/5a7db6c74d55bc51bdf39793
router.delete('/products/:id', requireToken, (req, res, next) => {
  Product.findById(req.params.id)
    .then(handle404)
    .then(product => {
      // throw an error if current user doesn't own `product`
      requireOwnership(req, product)
      // delete the product ONLY IF the above didn't throw
      product.remove()
    })
    // send back 204 and no content if the deletion succeeded
    .then(() => res.sendStatus(204))
    // if an error occurs, pass it to the handler
    .catch(next)
})

module.exports = router
