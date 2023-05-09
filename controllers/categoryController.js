const User = require('../models/userModel');
const Category = require('../models/categoryModel');
const Product = require('../models/productModel');
const bcrypt = require('bcrypt');
const { name } = require('ejs');
const { rawListeners } = require('../models/userModel');





let message = null
let success = null

const loadCategory = async (req, res) => {
    try {
        const categoryData = await Category.find()
        res.render('category', { categories: categoryData, message, success })
        message = null
        success = null
    } catch (error) {
        console.log(error.message);
    }
}


const loadAddCategory = async (req, res) => {
    try {
        res.render('new-category')

    } catch (error) {
        console.log(error.message);

    }
}

const addCategory = async (req, res) => {

    try {
        const categoryname = await Category.find()
        const same = await Category.findOne({ categoryName: req.body.categoryName.trim() })
        if (same) {
            message = "Ctegory name already exist"
            res.redirect('/admin/category')

        } else {
            const category = new Category({
                categoryName: req.body.categoryName.trim()
            });

            await category.save()
            success = "category added successfully"
            res.redirect('/admin/category')
        }

    } catch (error) {
        console.log(error.message);
    }
}

const loadEditCategory = async (req, res) => {
    try {
        const id = req.query.id
        console.log(id);
        const category = await Category.findOne({ _id: id })
        res.render('edit-category', { id, category })
    } catch (error) {
        console.log(error.message);
    }
}

const editCategory = async (req, res) => {

    try {
        const id = req.body.id
        const name = req.body.categoryName
        const same = await Category.findOne({ categoryName: req.body.categoryName.trim() })

        if (same) {
            message = "Ctegory name already exist"
            res.redirect('/admin/category')

        } else {

            const wait = await Category.findOneAndUpdate({ _id: id }, { categoryName: name },)
            res.redirect('/admin/category');
        }
    } catch (error) {
        console.log(error.message);
    }
}

const deleteCategory = async (req, res) => {
    try {
        const id = req.query.id
        const pro = await Product.findOne({ category: id })

        if (pro) {
            message = "canot delete category product exists"
            res.redirect('/admin/category')
        } else {

            console.log(id);
            const wait = await Category.findByIdAndDelete({ _id: id, })
            res.redirect('/admin/category')
        }
    } catch (error) {
        console.log(error.message);
    }

}




module.exports = {

    loadCategory,
    addCategory,
    loadAddCategory,
    loadEditCategory,
    editCategory,
    deleteCategory,



}