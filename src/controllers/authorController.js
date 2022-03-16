const authorModel = require("../models/authorModel")
const jwt = require('jsonwebtoken')



const createAuthor = async function (req, res) {
    try {
        let data = req.body
        if (Object.keys(data) == 0) {
            res.status(400).send({ status: false, msg: "Data must be present.BAD REQUEST" })
        } else {
            let createdAuthor = await authorModel.create(data)
            res.status(201).send({ data: createdAuthor })
        }
    } catch (err) {
        console.log("This is the error :", err.message)
        res.status(500).send({ msg: "Error", error: err.message })
    }

}

const loginAuthor = async function (req, res){
    try{
        let username = req.body.email
        let pass = req.body.password

        if(username && pass){
            let author = await authorModel.findOne({email : username, password: pass})
            if(!author) return res.status(404).send({status: false, msg: "please provide valid username or password"})
            let payLoad = {authorId : author._id}
            let secret = "group39"
            let token = jwt.sign(payLoad, secret )
            res.status(200).send({status: true, data: token})

        }else{
            res.status(400).send({status: false, msg: "Please provide username and password"})
        }
    }
    catch (err) {
        console.log("This is the error :", err.message)
        res.status(500).send({ msg: "Error", error: err.message })
    }
}


module.exports.createAuthor = createAuthor
module.exports.loginAuthor = loginAuthor