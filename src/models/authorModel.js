const mongoose = require('mongoose');

const authorSchema = new mongoose.Schema( {
    fName: {
        type:String,
        required: true
    },
    lName: {
        type: String,
        required: true
    },
    title: {
        type: String,
        enum: ["Mr", "Mrs", "Miss"],
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
        unique: true
    }

}, { timestamps: true });

module.exports = mongoose.model('author', authorSchema)