const blogModel = require("../models/blogModel")
const authorModel = require("../models/authorModel")
const mongoose = require("mongoose")



//  TO CREATE BLOGS
const createBlog = async function (req, res) {
    try {
        let data = req.body
        // const authorId = req.body.authorId;

        if (data.title && data.body && data.authorId && data.category) {

            if (!data.isPublished || data.isPublished == false) {
                let blogData = await blogModel.create(data);
                return res.status(201).send({ status: true, data: blogData });
            } else {
                data.publishedAt = new Date();
                let blogData = await blogModel.create(data);
                return res.status(201).send({ status: true, data: blogData });
            }

        } else {
            return res.status(400).send({ status: false, msg: "Required field missing" });
        }
    }
        
    catch (err) {
        console.log("This is the error :", err.message)
        res.status(500).send({ msg: "Error", error: err.message })
    }

}



//  TO GET BLOGS
const getBlogs = async function (req, res) {
    try {
        let filter = {
            isDeleted: false,
            isPublished: true
        };
        if (req.query.authorId) {
            filter["authorId"] = req.query.authorId;
        }
        if (req.query.category) {
            filter["category"] = req.query.category;
        }
        if (req.query.tags) {
            filter["tags"] = req.query.tags;
        }
        if (req.query.subcategory) {
            filter["subcategory"] = req.query.subcategory;
        }

        const blogs = await blogModel.find(filter);
        if (blogs.length > 0) {
            return res.status(200).send({ status: true, data: blogs });
        } else {
            return res.status(400).send({ status: false, msg: "not found" });
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
        let newData = req.body
        let blogId = req.params.blogId
        let authorIdFromToken = req.authorId

        //id  of blog data
        let updatedBlog = await blogModel.findOne({ _id: blogId })

        if (updatedBlog) {
            //inside if condition check that isPublished is  false and isDeleted is false
            if (updatedBlog.isDeleted == false)
            {
                if (newData.isPublished === true) {
                    newData.publishedAt = new Date()
                    if (newData.tags && updatedBlog.tags) {
                        if (typeof (newData.tags) === "object") {
                            newData.tags = [...newData.tags, ...updatedBlog.tags]
                        } else {
                            return res.status(404).send({ staus: false, msg: "Please send tags in 'array' format" })
                        }
                    }
                    if (newData.subcategory && updatedBlog.subcategory) {

                        if (typeof (newData.subcategory) === "object") {
                            newData.subcategory = [...newData.subcategory, ...updatedBlog.subcategory]
                        } else {
                            return res.status(404).send({ staus: false, msg: "Please send subcategory in 'array' format" })
                        }
                    }
                    let blogUpdated = await blogModel.findOneAndUpdate({ _id: blogId }, newData, { upsert: true, new: true })  //$set: { title: newData.title, body: newData.body, tags: newData.tags, subcategory: newData.subcategory, isPublished: true }
                    return res.status(200).send({ staus: true, msg: 'Blog is Updated', NewBlog: blogUpdated })
                } else {
                    if (newData.tags && updatedBlog.tags) {
                        if (typeof (newData.tags) === "object") {
                            newData.tags = [...newData.tags, ...updatedBlog.tags]
                        } else {
                            return res.status(404).send({ staus: false, msg: "Please send tags in 'array' format" })
                        }
                    }
                    if (newData.subcategory && updatedBlog.subcategory) {

                        if (typeof (newData.subcategory) === "object") {
                            newData.subcategory = [...newData.subcategory, ...updatedBlog.subcategory]
                        } else {
                            return res.status(404).send({ staus: false, msg: "Please send subcategory in 'array' format" })
                        }
                    }
                    let blogUpdated = await blogModel.findOneAndUpdate({ _id: blogId }, newData, { upsert: true, new: true })
                    return res.status(200).send({ staus: true, msg: 'UpdatedBlog', NewBlog: blogUpdated })
                }
            } else {
                return res.status(404).send({ staus: false, msg: "Blog does not exist" })
            }
            
        } else {
            return res.status(404).send({ staus: false, msg: "Blog does not exist" })
        }
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
        // const tokenAuthorId = req["x-api-key"]['_id']
        let blogData = await blogModel.findOne({ _id: id })
        let authorId = blogData.authorId
        if (blogData) {
                if (blogData.isDeleted == false) {
                    await blogModel.findOneAndUpdate({ _id: id }, { isDeleted: true, deletedAt: new Date() });
                    return res.status(200).send({ status: true, Message: "blog Deleted" })
                }
                else {
                    return res.status(404).send({ Message: "Blog document not exist" })
                }
            } else {
            return res.status(404).send({ Message: "blog document not exist" })
        }
    }
    catch (err) {
        console.log("This is the error :", err.message)
        res.status(500).send({ msg: "Error", error: err.message })
    }
}



//  TO DELETE BLOG BY QUERY PARAMS
const deleteBlogQuery = async function (req, res) {
    try{
        const authorId1 = req.query.authorId
        const tokenAuthorId = req["x-api-key"]['_id']
        if (authorId1) {

            const filter = {
                isDeleted: false,
                authorId: req.query.authorId
            };
            if (req.query.category) {
                filter["category"] = req.query.category;
            }

            if (req.query.tags) {
                filter["tags"] = req.query.tags;
            }
            if (req.query.subcategory) {
                filter["subcategory"] = req.query.subcategory;
            }
            if (req.query.isPublished) {
                filter["isPublished"] = req.query.isPublished;
            }

            let deleteData = await blogModel.updateMany(filter, { isDeleted: true, deletedAt: new Date() });
            if (deleteData.matchedCount > 0) {
                return res.status(200).send({ status: true, msg: "Blog has been deleted" });
            } else {
                return res.status(404).send({ status: false, msg: "No such blog exist" });
            }
        } else {
            const filter = {
                isDeleted: false,
                authorId: tokenAuthorId
            };
            if (req.query.category) {
                filter["category"] = req.query.category;
            }

            if (req.query.tags) {
                filter["tags"] = req.query.tags;
            }
            if (req.query.subcategory) {
                filter["subcategory"] = req.query.subcategory;
            }
            if (req.query.isPublished) {
                filter["isPublished"] = req.query.isPublished;
            }

            let deleteData = await blogModel.updateMany(filter, { isDeleted: true, deletedAt: new Date() });
            if (deleteData.matchedCount > 0) {
                return res.status(204).send({ status: true, msg: "Blog has been deleted" });
            } else {
                return res.status(404).send({ status: false, msg: "No such blog exist" });
            }

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