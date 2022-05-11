const jwt = require("jsonwebtoken");
const blogModel = require("../models/blogModel")


let authenticate= async function (req,res,next){
    try{
        let token = req.headers['x-api-key']
        if(!token)
        res.status(400).send({status: false, msg: "please provide token" })
         
        let validateToken = jwt.verify(token, "group39")
        if(!validateToken)
        res.status(401).send({status: false, msg: "authentication failed"})
        
        next()
    } 
    catch (err) {
        console.log("This is the error :", err.message)
        res.status(500).send({ msg: "Error", error: err.message })
    }
    }

let authorise= async function (req,res,next){
    try{
        let id = req.params.blogId
        let jwtToken = req.headers['x-api-key']
    
        let blogs = await blogModel.findById(id)
        if(!blogs)
        res.status(404).send({status: false, msg: "please provide valid blog ID"})
        
        if(blogs.isDeleted == true)
        res.status(404).send({status: false, msg: "No such blog found as blog is already deleted"})
  
        let verifiedToken = jwt.verify(jwtToken, "group39")
        if(verifiedToken.authorId != blogs.authorId)
        res.status(403).send({status: false, msg: "unauthorize access "})

        next()
    }
    
    catch (err) {
        console.log("This is the error :", err.message)
        res.status(500).send({ msg: "Error", error: err.message })
    }
}
    

module.exports.authenticate = authenticate
module.exports.authorise = authorise

