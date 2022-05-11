const jwt = require('jsonwebtoken')
const { default: mongoose } = require('mongoose')
const authorModel = require("../models/authorModel")



// *************************************************************** Validation ************************************************************* //
const isValidBody = function (body) {
    return Object.keys(body).length > 0;
}

const isValid = function (value) {
    if (typeof value === 'undefined' || value === null) return false; 
    if (typeof value === 'string' && value.trim().length === 0) return false;
    return true
}

const isValidEmail = function (value) {
    if (!(/^[a-z0-9+_.-]+@[a-z0-9.-]+$/.test(value.trim()))) {
        return false
    }
    return true
}


// *************************************************************** POST /authors ************************************************************ //
const createAuthor = async function (req, res) {
    try {
        //saving body data
        let body = req.body
        if(!isValidBody(body)) {
            return res.status(400).send({status: false, msg: "Body must not be empty"})
        }
        const { fname, lname, email, password, title } = body;

    if (!fname || fname.trim() === "") {
      return res.status(400).send({ status: false, message: "invalid required filled 'fname'" });
    }

    if (!lname || lname.trim() === "") {
      return res.status(400).send({ status: false, message: "invalid required filled 'lname'" });
    }

    if (title) {
      if (["Mr", "Mrs", "Miss"].indexOf(title) === -1) {
        return res.status(400).send({status: false, message: "Title must be 'Mr', 'Mrs', 'Miss'",
        });
      }
    }

    if (!isValidEmail(email) || isValidEmail(email.trim()) === "") {
      return res.status(400).send({ status: false, message: "invalid required filled 'email'" });
    }

    const isEmailAlreadyUsed = await authorModel.findOne({ email: email });

    if (isEmailAlreadyUsed) {
      return res.status(400).send({ status: false, message: "email already exist, please login!" });
    }

    if (!password || password.trim() === "") {
      return res.status(400).send({ status: false, message: "invalid required filled 'password'" });
    }

    if (password.length < 8 || password.length > 15) {
      return res.status(400).send({ status: false, message: "password length between 8 to 15" });
    }

    let savedData = await authorModel.create(body);
    res.status(201).send({status: "CREATED", message: "data successfully created", data: savedData });

   
    }
    catch (err) {
        console.log("This is the error :", err.message)
        res.status(500).send({ msg: "Error", error: err.message })
    }

}




// *************************************************************** POST /login ************************************************************ //
const loginAuthor = async function (req, res){
    try{
        const requestBody = req.body
        if (!isValidBody(requestBody)) {
            return res.status(400).send({ status: false, message: 'value in request body is required' })
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