let Article = require('../models/article.js');
let isEmptyObject = require('../utils/empty')
let db = require


/**
 * GET REQUEST '/article/:id' retrieves an Article model.
 * @param {Object} req
 * @param {Object} res
 */
exports.findOne = (req, res) => {
    Article.findOne({'_id': req.params.id}, function(err, article){
        if(err) res.status(400).json({"message":"No article with the given ID.","error": err});
        res.json(article);
    });
};

/**
 * GET REQUEST '/article' retrieves all neurons.
 * @param {Object} req
 * @param {Object} res
 */
exports.find = (req, res) => {
    Article.find({}, function(err, articles){
        if(err){
            res.status(500).json({"message":"Something went wrong.","error": err});
        }else if(isEmptyObject(articles)){
            res.status(500).json({"message":"No article registered yet.","error": err});
        }else{
            res.json(articles);
        }
    });
};

/**
 * POST REQUEST '/' creates an article.
 * @param {Object} req
 * @param {Object} res
 */
exports.create = (req, res) => {
    if(Object.keys(req.body).length !== 0){
        Article.create({
            'title': req.body.title,
            'content': req.body.content,
            'author': req.body.author,
            'category': req.body.category
        }, function(err, article){
            if(err) res.status(400).json({ 'message':'Something went wrong during the creation of the article.', 'error': err });
            res.json({'article':article, 'message':'Article created with success'});
        });
    }else{
        Article.create({
            'title': 'Dummy Article',
            'content': 'This is a dummy article.',
            'author': 'John Doe',
            'category': 'Travel'
        }, function(err, article){
            if(err) res.status(400).json({ 'message':'Something went wrong during the creation of the article.', 'error': err });
            res.json({'article': article, 'message':'Article created with success'});
        });
    }
};

exports.delete = (req, res) => {

    Article.remove({'_id': req.params.id}, function (err, article){
        if(err) res.status(400).json({"message":"Something went wrong during the deletion of the article.","error": err});
        res.json({'article': article, 'message':'Article deleted with success.'});
    })
}

exports.update = (req, res, next) => {
    Article.updateOne({'_id': req.body.id},{"title": req.body.title, "content": req.body.content, "author": req.body.author}, function(err, article){
        if(err) res.status(400).json({"message":"No article with the given ID.","error": err});
        res.json({"message":"Article updated with success"});
    });
}