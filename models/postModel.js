
const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        min: 3,
        max: 100
    },
    content: {
        type: String,
        required: true,
        max: 10000
    },
    author: {
        type: String,
        required: true
    },
    authorName: {
        type: String,
        required: true
    }, 
    dateOfCreated: {
        type: Date,
        default: () => Date.now()
    }
});

module.exports = mongoose.model('Posts', postSchema);