let express = require('express');
let router = express.Router();
let articleController = require('../app/controllers/articleController');


router.route('/')
  .get(articleController.find)
  .post(articleController.create);

router.route('/:id')
  .get(articleController.findOne)
  .put(articleController.update)
  .delete(articleController.delete)

module.exports = router;
