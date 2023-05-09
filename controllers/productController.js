const User = require('../models/userModel');
const Category = require('../models/categoryModel');
const Product = require('../models/productModel');
const bcrypt = require('bcrypt');
const { name } = require('ejs');
const { rawListeners } = require('../models/userModel');

let message



const loadProducts = async (req, res) => {
  try {

    const productData = await Product.find().populate('category')
    const pro = await Product.find({})

    res.render('products', { products: productData, pro: pro })
  } catch (error) {
    console.log(error.message);
  }
}

const loadAddProducts = async (req, res) => {
  try {
    const categoryData = await Category.find({})

    res.render('add-products', { categories: categoryData })
  } catch (error) {
    console.log(error.message);
  }
}

const addProduct = async (req, res) => {
  try {
    let images = []
    for (let i = 0; i < req.files.length; i++) {
      images[i] = req.files[i].filename
    }

    const findCategory = await Category.findOne({ categoryName: req.body.category })
    const product = new Product({
      productName: req.body.productName,
      price: req.body.price,
      category: findCategory._id,
      image: images,
      brand: req.body.brand,
      description: req.body.description,
      stock: req.body.stock,
      size: req.body.size
    });
    await product.save();
    res.redirect('/admin/products');
  } catch (error) {
    console.log(error.message);
  }
}

const loadEditProduct = async (req, res) => {
  try {

    const id = req.params.id;
    console.log(id + "llllllllllllllllll");
    const categoryData = await Category.find({})

    const productData = await Product.findById({ _id: id }).populate('category')

    console.log(productData + "kkkkkkkkkkkkkkkkkkk");
    console.log('mmmmmmmm \n \n');
    console.log(id);
    res.render('edit-products', { id: id, categories: categoryData, productData });
  } catch (error) {
    console.log(error.message);
  }
}



const editProduct = async (req, res) => {
  try {

    const productData = await Product.findById({ _id: req.body.id }).populate('category')
    let images = []
    if (req.files.length > 0) {
      for (let i = 0; i < req.files.length; i++) {
        images[i] = req.files[i].filename
      }
    }
    const findCategory = await Category.findOne({ categoryName: req.body.category })
    if (!findCategory) {
      throw new Error('Category not found')
    }

    const id = req.body.id
    const image = productData.image.concat(images)
    const name = req.body.productName
    const brand = req.body.brand
    const stock = req.body.stock
    const size = req.body.size
    const description = req.body.description
    const category = findCategory._id
    const price = req.body.price

    Product.findOneAndUpdate(
      { _id: id },
      {
        productName: name,
        price: price,
        category: category,
        brand: brand,
        stock: stock,
        description: description,
        size: size,
        image: image,
      },
      { new: true },
      (err, updatedProduct) => {
        if (err) {
          console.error(err);
        } else {
          console.log('Document updated successfully');
          console.log(updatedProduct);
        }
      }
    );

    res.redirect('/admin/products')
  } catch (error) {
    console.log(error.message);
    res.status(400).send(error.message)
  }
}








const unListProduct = async (req, res) => {

  try {
    const id = req.params.id
    const productData = await Product.findOne({ _id: id }, { is_unListed: 1 })
    if (productData.is_unListed == false) {
      const wait = await Product.updateOne({ _id: id }, { $set: { is_unListed: true } })
      res.redirect('/admin/products')
    } else {
      const wait = await Product.updateOne({ _id: id }, { $set: { is_unListed: false } })
      res.redirect('/admin/products');
    }
  } catch (error) {
    console.log(error.message);
  }

}


const productsimagremove = async (req, res) => {
  try {
    const file = req.query.file

    const productId = req.query.productId
    console.log(file, productId, 'dfhhdgfh');
    await Product.updateOne({ _id: productId }, { $pull: { image: file } })
    res.send({ success: true, janu: 'dddd' })

  } catch (error) {
    console.log(error.message);
  }
}


const deleteImage = async (req, res) => {
  try {
    const productId = req.query.productId;
    const index = req.query.index;
    const deletedImage = await Product.updateOne(
      { _id: productId },
      { $unset: { [`image.${index}`]: "" } }
    );
    const deletedImages = await Product.updateOne(
      { _id: productId },
      { $pull: { image: null } }
    );

    console.log(deletedImage, deletedImage);
    res.redirect("/admin/edit-products/" + productId);
  } catch (error) {
    console.log(error);
  }
};


const categoryFilter = async (req, res) => {
  try {
    console.log(12468);
    let { id, search, price } = req.query;
    price = Number(price)
    console.log(typeof (price));
    console.log(req.query);
    const loginsession = req.session.user_id;
    const category = await Category.find({});
    console.log(124);
    let productdetails;
    if (search !== "undefined") {
      console.log('1')
      if (id !== "undefined") {
        console.log('2')
        if (price != "undefined") {
          console.log('3')
          productdetails = await Product.find({
            category: id,
            $or: [{ productName: { $regex: ".*" + search + ".*", $options: "i" } }],
          }).sort({ price: price })
        } else {
          console.log('4')
          if (price != "undefined") {
            console.log('5')
            productdetails = await Product.find({
              category: id,
              $or: [{ productName: { $regex: ".*" + search + ".*", $options: "i" } }],
            }).sort({ price: price })
          } else {
            console.log('6')
            productdetails = await Product.find({
              category: id,
              $or: [{ productName: { $regex: ".*" + search + ".*", $options: "i" } }],
            })
          }
        }
      } else {
        if (price !== "undefined") {
          productdetails = await Product.find({
            $or: [{ productName: { $regex: ".*" + search + ".*", $options: "i" } }],
          }).sort({ price: price })
        } else {
          productdetails = await Product.find({
            $or: [{ productName: { $regex: ".*" + search + ".*", $options: "i" } }],
          })
        }
      }
    } else if (id != 'undefined') {
      console.log(124656);
      if (price !== "undefined") {
        productdetails = await Product.find({ category: id }).sort({ price: price })
      } else {
        productdetails = await Product.find({ category: id })
      }
    } else if (price) {
      console.log(2345678903456789);
      productdetails = await Product.find({}).sort({ price: price })
    }
    res.send({ success: true, products: productdetails });
  } catch (error) {
    res.status(500).send("Server Error");
  }
};












module.exports = {



  loadProducts,
  loadAddProducts,
  addProduct,
  loadEditProduct,
  editProduct,
  unListProduct,
  categoryFilter,
  productsimagremove,
  deleteImage


}