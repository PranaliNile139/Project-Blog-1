const jwt = require('jsonwebtoken')
const { default: mongoose } = require('mongoose')
const authorModel = require("../models/authorModel")


const createAuthor = async function (req, res) {
    try {
        //saving body data
        let data = req.body
        if (data.fName && data.lName && data.title && data.email && data.password) {
            if (data) {
                //validating Email using #regex
                const verifyEmail = (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(data.email))   
                if (verifyEmail) {
                    //saving author details in "author" collection
                    let savedData = await authorModel.create(data)                                       
                    return res.status(201).send({ status: true, msg: savedData })
                } else {
                    return res.status(401).send({ status: false, msg: "invalid email" })
                }
            } else {
                return res.status(400).send({ status: false, msg: "please provide Author data" })
            }
        } else {
            return res.status(401).send({ status: false, msg: "Required fieled is missing" })
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
            return res.status(404).send({status: false, msg: "Valid credentials required"})
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