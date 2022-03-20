const jwt = require('jsonwebtoken')
const { default: mongoose } = require('mongoose')
// const validator = require('validator');
const authorModel = require("../models/authorModel")

const isValid = function(value) {
    if(typeof value === 'undefined' || value === null) return false
    if(typeof value === 'string' && value.trim().length === 0) return false
    return true;
}

const isValidBody = function(requestBody) {
    return Object.keys(requestBody).length !== 0
}

const validObject = function(value) {
      return mongoose.Types.ObjectId.isValid(value)
}

const validTitle = function(value) {
    return ["Mr", "Mrs", "Miss"].indexOf(value) !== -1
}

const createAuthor = async function (req, res) {
    try {
        let data = req.body
        if (!isValidBody(data)) {
            return res.status(400).send({ status: false, msg: "Data must be present.BAD REQUEST" })
        }
        const {fName, lName, title, email, password} = data
       if(!isValid(fName)){
           return res.status(400).send({status: false, msg: "provide fname"})
       }
       if(!isValid(lName)){
            return res.status(400).send({status: false, msg: "provide lname"})
        }
        if(!isValid(title)){
            return res.status(400).send({status: false, msg: "provide title"})
        }
        if(!validTitle(title)){
            return res.status(400).send({status: false, msg: "provide a valid title"})
        }
        if(!isValid(email)){
            return res.status(400).send({status: false, msg: "provide email"})
        }
        if (!(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email.trim()))) {
            return res.status(400).send({ status: false, message: "Enter a valid email id" })
            
        }
        if(!isValid(password)){
            return res.status(400).send({status: false, msg: "provide password"})
        }
        
        let findEmail = await authorModel.findOne({email: email})
        if(findEmail){
            return res.status(400).send({status: false, msg: "email already exist"})
        }
    
        let createdAuthor = await authorModel.create(data)
        if(createdAuthor) {
            return res.status(201).send({status: true, data: createdAuthor })
        }
    }
    catch (err) {
        console.log("This is the error :", err.message)
        res.status(500).send({ msg: "Error", error: err.message })
    }

}

const loginAuthor = async function (req, res){
    try{
        const requestBody = req.body
        if (!isValidBody(requestBody)) {
            res.status(400).send({ status: false, message: 'value in request body is required' })
            return
        }
        
        let email = req.body.email
        let password = req.body.password

        if (!isValid(email)) {
            res.status(400).send({ status: false, message: 'Please provide valid email' })
            return
        }

        if (!(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email))) {
            res.status(400).send({ status: false, message: `Email should be a valid email address` })
            return
        }

        if (!isValid(password)) {
            res.status(400).send({ status: false, message: 'password must be present' })
            return
        }

        if(email && password){
            let author = await authorModel.findOne({email : email, password: password})
            if(!author)
            return res.status(404).send({status: false, msg: "please correct your credentials"})
            let payLoad = {authorId : author._id}
            let secret = "group39"
            let token = jwt.sign(payLoad, secret )
            return res.status(200).send({status: true, data: token})

        }
    }
    catch (err) {
        console.log("This is the error :", err.message)
        res.status(500).send({ msg: "Error", error: err.message })
    }
}


module.exports.createAuthor = createAuthor
module.exports.loginAuthor = loginAuthor