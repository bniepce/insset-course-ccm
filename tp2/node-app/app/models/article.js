let mongoose = require('mongoose');
let Schema = mongoose.Schema;

/**
 * Article model schema.
 */
let articleSchema = new Schema({
    title: String,
    content: String,
    author: String,
    category: String
});

let Article = mongoose.model('Article', articleSchema);

module.exports = Article;