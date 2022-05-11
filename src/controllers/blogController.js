const blogModel = require("../models/blogModel")
const authorModel = require("../models/authorModel")
const mongoose = require("mongoose")



// *************************************************************** Validation ************************************************************* //
const isValidBody = function (body) {
    return Object.keys(body).length > 0;
}

const isValid = function (value) {
    if (typeof value === 'undefined' || value === null) return false; 
    if (typeof value === 'string' && value.trim().length === 0) return false;
    return true
}

const isValidObjectId = function (objectId) {
    return mongoose.Types.ObjectId.isValid(objectId)
}

// *************************************************************** POST /blogs ************************************************************* //
const createBlog = async function (req, res) {
    try {
        let data = req.body
        if(!isValidBody(data)) {
            return res.status(400).send({status: false, msg: "Body must not be empty"})
        }
        const { title, body, authorId, tags, category, subcategory, isPublished } = data;

        if (!isValidObjectId(authorId)) {
            return res.status(400).send({ status: false, message: `${authorId} is not a valid author id` })
        }
        const author = await authorModel.findById(authorId);
        if (!author) {
            return res.status(400).send({ status: false, message: `Author does not exit` })
        }
        const blogData = {
            title,
            body,
            tags,
            authorId,
            category,
            subcategory,
            isPublished: isPublished ? isPublished : false,
            publishedAt: isPublished ? new Date() : null
        }
        const newBlog = await blogModel.create(blogData)
        return res.status(201).send({ status: true, message: 'New blog created successfully', data: newBlog })

    }
        
    catch (err) {
        console.log("This is the error :", err.message)
        res.status(500).send({ msg: "Error", error: err.message })
    }

}



// *************************************************************** GET /blogs ************************************************************* //
const getBlogs = async function (req, res) {
    try {
        const body = req.body;
        if(isValidBody(body)) {
            return res.status(400).send({ status: false, msg: "Body must not be present"})
        }

        const query = req.query;
        let filter = {
            isDeleted: false,
            isPublished: true
        }

        const{authorId, category, tags, subcategory} = query;

        if ((authorId) && isValidObjectId(authorId)) {
            filter["authorId"] = authorId;
        }
        if (category) {
            filter["category"] = category.trim();
        }
        if (tags) {
            filter["tags"] = tags.trim();
        }
        if (subcategory) {
            filter["subcategory"] = subcategory.trim();
        }

        const blogs = await blogModel.find(filter);
        if (blogs.length > 0) {
            return res.status(200).send({ status: true, data: blogs });
        } else {
            return res.status(404).send({ status: false, msg: "no blogs found" });
        }
    }
    catch (err) {
        console.log("This is the error :", err.message)
        res.status(500).send({ msg: "Error", error: err.message })
    }
}



// *********************************************************** PUT /blogs/:blogId *********************************************************** //
const updateBlog = async function (req, res) {
    try {
        let newData = req.body
        let blogId = req.params.blogId
        let authorIdFromToken = req.authorId

        if(!isValidBody(newData)) {
            return res.status(400).send({status: false, msg: "Body must not be empty"})
        }

        if (!isValidObjectId(blogId)) {
            return res.status(400).send({ status: false, message: `${blogId} is not a valid blog id` })
          }

        //id  of blog data
        let Blog = await blogModel.findOne({ _id: blogId, isDeleted: false})

        if (!Blog) {
            return res.status(404).send({status: false, msg: "Blog not found"})
        }
        
        const { title, body, tags, subcategory, isPublished } = newData;

        if (title) {
            await blogModel.findByIdAndUpdate({ _id: req.params.blogId }, { $set: { title: title } }, { new: true })
        }
        
        if (body) {
            await blogModel.findByIdAndUpdate({ _id: req.params.blogId }, { $set: { body: body } }, { new: true })
        }
    
        if (tags) {
            await blogModel.findByIdAndUpdate({ _id: req.params.blogId }, { $addToSet: { tags: { $each: tags } } }, { new: true })
        }
    
        if (subcategory) {
            await blogModel.findByIdAndUpdate({ _id: req.params.blogId }, { $addToSet: { subcategory: { $each: subcategory } } }, { new: true })
        }
        
        if (isPublished == true) {
            await blogModel.findByIdAndUpdate({ _id: req.params.blogId }, { $set: { isPublished: isPublished, publishedAt: new Date() } }, { new: true })
    
        }
    
        if (isPublished == false) {
            await blogModel.findByIdAndUpdate({ _id: req.params.blogId }, { $set: { isPublished: isPublished, publishedAt: null } }, { new: true })
        }

        const updatedBlog = await blogModel.findById({ _id: req.params.blogId });
        return res.status(200).send({ status: true, msg: "Blog updated successfully", data: updatedBlog });

    }
    
    catch (err) {
        console.log("This is the error :", err.message)
        res.status(500).send({ msg: "Error", error: err.message })
    }
}



// ********************************************************** DELETE /blogs/:blogId ******************************************************** //
const deleteBlog = async function (req, res) {
    try {
        let blogId = req.params.blogId
        if (!isValidObjectId(blogId)) {
            return res.status(400).send({ status: false, message: `${blogId} is not a valid blog id` })
        }

        let blogData = await blogModel.findOne({ _id: blogId, isDeleted: false })
        if (!blogData) {
            return res.status(404).send({status: false, msg: "Blog not found"})
        }
        
        await blogModel.findOneAndUpdate({ _id: blogId }, { $set: { isDeleted: true, deletedAt: new Date(), isPublished: false, publishedAt: null } });
        return res.status(200).send({ status: true, Message: "blog Deleted" })

    }
    catch (err) {
        console.log("This is the error :", err.message)
        res.status(500).send({ msg: "Error", error: err.message })
    }
}



// ************************************************************* DELETE /blogs ******************************************************** //
const deleteBlogQuery = async function (req, res) {
    try{

        let authorId = req.query.authorId;
           
        let updatedfilter = {isDeleted:false}
            
        if (authorId) {
            updatedfilter["authorId"] = req.query.authorId
        }
        if (req.query.category) {
            updatedfilter["category"] = req.query.category
        }
        if (req.query.tags) {
            updatedfilter["tags"] = req.query.tags
        }
        if (req.query.subcategory) {
            updatedfilter["subcategory"] = req.query.subcategory
        }
        if (req.query.isPublished) {
            updatedfilter["isPublished"] = req.query.isPublished
        }
            
        let deleteData = await blogModel.findOne(updatedfilter)
        if (!deleteData) {
            return res.status(404).send({ status: false, msg: "blog is already deleted" });
        }
            
        deleteData.isDeleted = true;
        deleteData.deletedAt = new Date()
        deleteData.save();
            
        return res.status(200).send({ msg: "This blog is Succesfully deleted" });
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