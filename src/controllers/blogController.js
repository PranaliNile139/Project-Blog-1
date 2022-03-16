const { count } = require("console")
const blogModel = require("../models/blogModel")
const authorModel = require("../models/authorModel")
const moment = require('moment')

const createBlog = async function (req, res) {
    try {
        let data = req.body
        let authorId = data.authorId
        
        if (!authorId) {
            res.status(400).send({ status: false, msg: "AuthorId must be present" })
        }
        let authorDetails = await authorModel.findById(authorId)
        if (!authorDetails) {
            res.status(404).send({ status: false, msg: "author id does not exist" })
        } else {
            let blogCreated = await blogModel.create(data)
            res.status(201).send({ status: true, data: blogCreated })
        }


    }  catch (err) {
        console.log("This is the error :", err.message)
        res.status(500).send({ msg: "Error", error: err.message })
    }

}

const getBlogs = async function (req, res) {
    try {
        let authorId = req.query.authorId
        let category = req.query.category
        let tags = req.query.tags
        let subcategory = req.query.subcategory

        let blogsData = await blogModel.find( { $or: [{authorId: authorId}, {category: category}, {tags: tags}, {subcategory: subcategory}], isDeleted: false, isPublished: true })
        // if (blogsData.length == 0) {
        //     res.status(404).send({ status: false, msg: "No blogs Available." })
        // } else {
            res.status(200).send({ status: true, data: blogsData })   
        // }
    }
    catch (err) {
        console.log("This is the error :", err.message)
        res.status(500).send({ msg: "Error", error: err.message })
    }
}

const updateBlog = async function (req, res) {
    try {
        let newTitle = req.body.title
        let newBody = req.body.body
        let newTag = req.body.tags
        let newSubCategory = req.body.subcategory
        let id = req.params.blogId

        let blog_id = await blogModel.findById(id)
        if(!blog_id) {
            res.status(404).send({ status: false, msg: "blogId doesnot exist"})
        }

        let blog = await blogModel.findOneAndUpdate(
            { _id: id},
            { $set: { title: newTitle, body: newBody, isPublished: true, publishedAt: new Date() }, $push: { tags: newTag, subcategory: newSubCategory } },
            { new: true }
        )
             res.status(200).send({ status: true, data: blog })
    }
    catch (err) {
        console.log("This is the error :", err.message)
        res.status(500).send({ msg: "Error", error: err.message })
    }
}


const deleteBlog = async function (req, res) {
    try {
        let id = req.params.blogId
        let blog = await blogModel.findById(id)
        if(!blog) {
            res.status(404).send({ status: false, msg:"blog does not exist"})
        }
        if(blog.isDeleted == false) {
        let deleted = await blogModel.findOneAndUpdate({ _id: id }, { isDeleted: true, deletedAt: new Date() }, { new: true })
        res.status(200).send({status: true})
        } else {
            res.status(404).send({status: false, msg: "data already deleted"})
        }
    }
    catch (err) {
        console.log("This is the error :", err.message)
        res.status(500).send({ msg: "Error", error: err.message })
    }
}


const deleteBlogQuery = async function (req, res) {
    try {
        let authorId = req.query.authorId
        let category = req.query.category
        let tag = req.query.tag
        let subcategory = req.query.subcategory

        if(!(authorId || category || tag || subcategory)) {
            res.status(400).send({status: false, msg: "blog data is required"})
        } else{
            let deletedBlog = await blogModel.deleteOne({ $or:[ { authorId: authorId}, {category: category}, {tag,tag}, {subcategory: subcategory} ] } )
            res.status(200).send({status:true, msg: deletedBlog})
        }
            
        }
    catch (err) {
        console.log("This is the error :", err.message)
        res.status(500).send({ msg: "Error", error: err.message })
    }
}

module.exports.createBlog = createBlog
module.exports.getBlogs = getBlogs
module.exports.updateBlog = updateBlog
module.exports.deleteBlog = deleteBlog
module.exports.deleteBlogQuery = deleteBlogQuery