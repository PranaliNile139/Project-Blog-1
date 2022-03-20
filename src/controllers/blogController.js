// const { count } = require("console")
const blogModel = require("../models/blogModel")
const authorModel = require("../models/authorModel")
const mongoose = require("mongoose")


const isValid = function (value) {
    if (typeof value === 'undefined' || value === null) return false
    if (typeof value === 'string' && value.trim().length === 0) return false
    return true;
}

const validObject = function (value) {
    return mongoose.Types.ObjectId.isValid(value)
}

const isValidrequestBody = function (requestBody) {
    return Object.keys(requestBody).length !== 0
}



//  TO CREATE BLOGS
const createBlog = async function (req, res) {
    try {
        let data = req.body
        const { title, body, authorId, tags, category, subcategory, isPublished } = data
        if(!isValidrequestBody(data)){
            return res.status(400).send({status: false, message: "Enter valid blog details to create"})
        }
        if (!isValid(title)) {
            res.status(400).send({ status: false, message: 'Blog Title is required' })
            return
        }

        if (!isValid(body)) {
            return res.status(400).send({ status: false, message: 'body is missing' })
        }

        if (!isValid(authorId)) {
            return res.status(400).send({ status: false, message: 'Author id is required' })
        }

        if (!validObject(authorId)) {
            return res.status(400).send({ status: false, message: `${authorId} is not a valid author id` })
        }

        if (!isValid(category)) {
            return res.status(400).send({ status: false, message: 'Blog category is required' })
        }


        // let authorDetails = await authorModel.findById(authorId)
        // if (!authorDetails) {
        //     res.status(404).send({ status: false, msg: "author id does not exist" })
        // }

        const blogData = {
            title,
            body,
            authorId,
            category,
            isPublished: isPublished ? isPublished : false,
            publishedAt: isPublished ? new Date() : null
        }

        if (tags) {
            if (Array.isArray(tags)) {
                blogData['tags'] = [...tags]
                console.log(blogData)
            }
            if (Object.prototype.toString.call(tags) === "[object String]") {
                blogData['tags'] = [tags]
            }
        }

        if (subcategory) {
            if (Array.isArray(subcategory)) {
                blogData['subcategory'] = [...subcategory]
            }
            if (Object.prototype.toString.call(subcategory) === "[object String]") {
                blogData['subcategory'] = [subcategory]
            }
        }

        if (category) {
            if (Array.isArray(category)) {
                blogData['subcategory'] = [...category]
            }
            if (Object.prototype.toString.call(category) === "[object String]") {
                blogData['subcategory'] = [category]
            }
        }
        
        
        let blogCreated = await blogModel.create(data)
        res.status(201).send({ status: true, data: blogCreated })
    
    } 
    catch (err) {
        console.log("This is the error :", err.message)
        res.status(500).send({ msg: "Error", error: err.message })
    }

}



//  TO GET BLOGS
const getBlogs = async function (req, res) {
    try {
        const filterQuery = { isDeleted: false, deletedAt: null, isPublished: true }
        const queryParams = req.query

        if (isValidrequestBody(queryParams)) {
            const { authorId, category, tags, subcategory } = queryParams

            if (isValid(authorId) && validObject(authorId)) {
                filterQuery['authorId'] = authorId
            }

            if (isValid(category)) {
                filterQuery['category'] = category.trim()
            }

            if (isValid(tags)) {
                const tagsArr = tags.trim().split(',').map(tag => tag.trim());
                filterQuery['tags'] = { $all: tagsArr }
            }

            if (isValid(subcategory)) {
                const subcat = subcategory.trim().split(',').map(i => i.trim());
                filterQuery['subcategory'] = { $all: subcat }
            }
        }

        let blogsData = await blogModel.find(filterQuery)
        if (Array.isArray(blogsData) && blogsData.length === 0) {
            return res.status(404).send({ status: false, msg: "No blogs Available." })
        } else {
            res.status(200).send({ status: true, data: blogsData })   
        }
    }
    catch (err) {
        console.log("This is the error :", err.message)
        res.status(500).send({ msg: "Error", error: err.message })
    }
}



//  TO UPDATE BLOGS
const updateBlog = async function (req, res) {
    try {
        let updateBody = req.body
        let id = req.params.blogId
        let authorIdFromToken = req.authorId


        if (!validObject(id)) {
            return res.status(400).send({ status: false, message: "blogId is not valid" })
        }

        let blog_id = await blogModel.findOne({isDeleted: false, _id:id})
        if(!blog_id) {
            return res.status(404).send({ status: false, msg: "blog doesnot exist"})
        }

        
        if(id.authorId !== authorIdFromToken){
            return res.status(401).send({status: false, message: "Unauthorised Access"})
            
        }

        const { title, body, tags, category, subcategory, isPublished } = updateBody
        let updateField = {}
        if(isValid(title)) {
            if(!Object.prototype.hasOwnProperty.call(updateField, '$set')) updateField['$set'] = {}
            updateField['$set']['title'] = title
        }

        if(isValid(body)) {
            if(!Object.prototype.hasOwnProperty.call(updateField, '$set')) updateField['$set'] = {}
            updateField['$set']['body'] = body
        }

        if(isValid(category)) {
            if(!Object.prototype.hasOwnProperty.call(updateField, '$set')) updateField['$set'] = {}
            updateField['$set']['category'] = category
        }

        if(isPublished !== undefined) {
            if(!Object.prototype.hasOwnProperty.call(updateField, '$set')) updateField['$set'] = {}
            updateField['$set']['isPublished'] = isPublished
            updateField['$set']['publishedAt'] = isPublished ? new Date() : null
        }
        
        if(tags) {
            if(!Object.prototype.hasOwnProperty.call(updateField, '$addToSet')) updateField['$addToSet'] = {}
            if(Array.isArray(tags)) {
                updateField['$addToSet']['tags'] = { $each: [...tags]}
            }
            if(typeof tags === "string") {
                updateField['$addToSet']['tags'] = tags
            }
        }

        if(subcategory) {
            if(!Object.prototype.hasOwnProperty.call(updateField, '$addToSet')) updateField['$addToSet'] = {}
            if(Array.isArray(subcategory)) {
                updateField['$addToSet']['subcategory'] = { $each: [...subcategory]}
            }
            if(typeof subcategory === "string") {
                updateField['$addToSet']['subcategory'] = subcategory
            }
        }
        
        // isDeleted should be false 
        const blog = await blogModel.findOneAndUpdate( { _id: id}, updateField, {new: true} )
            return res.status(200).send({ status: true, data: blog })
    }
    catch (err) {
        console.log("This is the error :", err.message)
        res.status(500).send({ msg: "Error", error: err.message })
    }
}



//  TO DELETE BLOGS
const deleteBlog = async function (req, res) {
    try {
        let id = req.params.blogId
        let authorIdFromToken = req.authorId
        
        if(!validObject(id)){
            return res.status(400).send({status: false, message: "Enter a valid blogId"})
        }

        let checkBlog = await blogModel.findOne({_id: id, isDeleted: false})
        if(!checkBlog){
            return res.status(400).send({status: false, message: "The blog has already been deleted"})
        }

        if(id.authorId !== authorIdFromToken){
            return res.status(401).send({status: false, message: "Unauthorised Access "})
        }

        await blogModel.findOneAndUpdate({ _id: id }, { isDeleted: true, deletedAt: new Date() }, { new: true })
        res.status(200).send({status: true, msg: "Blog successfully deleted"})
        
    }
    catch (err) {
        console.log("This is the error :", err.message)
        res.status(500).send({ msg: "Error", error: err.message })
    }
}



//  TO DELETE BLOG BY QUERY PARAMS
const deleteBlogQuery = async function (req, res) {
    try{
        const filterQuery = {isDeleted: false}
        const queryParams = req.query
        const authorIdFromToken = req.authorId
    
        if (!isValidrequestBody(queryParams)) {
            res.status(400).send({ status: false, message: "Nothing to delete" })
            return
        }

        const { authorId, category, tags, subcategory, isPublished } = queryParams

        if (isValid(authorId) && validObject(authorId)) {
            filterQuery['authorId'] = authorId
        }

        if (isValid(category)) {
            filterQuery['category'] = category
        }

        if (isValid(isPublished)) {
            filterQuery['isPublished'] = isPublished
        }

        if (isValid(tags)) {
            const tagsArr = tags.trim().split(',').map(tag => tag.trim());
            filterQuery['tags'] = { $all: tagsArr }
        }

        if (isValid(subcategory)) {
            const subcatArr = subcategory.trim().split(',').map(i => i);
            filterQuery['subcategory'] = { $all: subcatArr }
        }

        const blogs = await blogModel.find(filterQuery);
        if (Array.isArray(blogs) && blogs.length == 0) {
            res.status(404).send({ status: false, message: "No matching blogs found" })
            return
        }

        const idsOfBlogsToDelete = blogs.map(blog => {
            if (blog.authorId.toString() === authorIdFromToken) return blog._id
        })

        if (idsOfBlogsToDelete.length === 0) {
            res.status(404).send({ status: false, message: 'No blogs found' })
            return
        }


        await blogModel.updateMany({ _id: { $in: idsOfBlogsToDelete } }, { $set: { isDeleted: true, deletedAt: new Date() } })
        return res.status(200).send({status: true, msg: "Blogs deleted successfully"})
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