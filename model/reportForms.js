/**
 * Created by codeplay on 2017/4/16.
 */
var mongoose = require('mongoose')
var Schema = require('../schemas/reportForms') //拿到导出的数据集模块
var UsersModel = mongoose.model('Users', Schema.UsersSchema) // 编译生成Model 模型
var drugsModel=mongoose.model('drugs',Schema.drugsSchema);
var orgsModel=mongoose.model('orgs',Schema.orgsSchema);
/*
//示例：使用model增加一条数据
var person1={name:'Alice',paw:'FE'};
UsersModel.create(person1);

//使用entity来增加一条数据
var person3=new UsersModel({name:'Candy',paw:'BE'});
person3.save();

*/
module.exports.UsersModel = UsersModel;
module.exports.drugsModel = drugsModel;
module.exports.orgsModel = orgsModel;