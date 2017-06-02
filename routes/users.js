var express = require('express');
var dbModel = require('../model/reportForms');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});
//查询所有用户数据
router.get('/users', function(req, res, next) {
    dbModel.UsersModel.fetch(function (err, users) {
        if (err) {
            console.log(err);
        }
        res.render('users', {title: '用户列表', users: users})  //这里也可以json的格式直接返回数据res.json({data: users});
    })
});
module.exports = router;
