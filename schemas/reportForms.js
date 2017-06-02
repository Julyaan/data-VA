/**
 * Created by codeplay on 2017/4/16.
 */
var mongoose = require('mongoose');

//测试内容：申明一个mongoons的对象
var UsersSchema = new mongoose.Schema({
    name: String,
    paw: String,
    meta: {
        createAt: {
            type: Date,
            default: Date.now()
        },
        updateAt: {
            type: Date,
            default: Date.now()
        }
    }
})

//每次执行都会调用,时间更新操作
UsersSchema.pre('save', function(next) {
    if(this.isNew) {
        this.meta.createAt = this.meta.updateAt = Date.now();
    }else {
        this.meta.updateAt = Date.now();
    }

    next();
})

//查询的静态方法
UsersSchema.statics = {
    fetch: function(cb) { //查询所有数据
        console.log(cb);
        return this
            .find()
            .sort('meta.updateAt') //排序
            .exec(cb) //回调
    },
    findById: function(id, cb) { //根据id查询单条数据
        return this
            .findOne({_id: id})
            .exec(cb)
    }
}

//hospitan medical income 医院医疗服务费收入统计
var orgsSchema=new mongoose.Schema({
    institution: String,
    year: Number,
    month: Number,
    day: Number,
    outpatient:{
        income1:Number,income2:Number,income3:Number,income4:Number,income5:Number,income6:Number,income7:Number,
        income8:Number,income9:Number,income10:Number,income11:Number,income12:Number,income13:Number,income14:Number,
        income15:Number,income16:Number,income17:Number,income18:Number,income19:Number,income20:Number,income21:Number,
    },
    person:{
        numbers1:Number, numbers2:Number, numbers3:Number, numbers4:Number, numbers5:Number, numbers6:Number, numbers7:Number,
        numbers8:Number, numbers9:Number, numbers10:Number, numbers11:Number, numbers12:Number, numbers13:Number, numbers14:Number
    },
    meta: {
        createAt: {
            type: Date,
            default: Date.now()
        },
        updateAt: {
            type: Date,
            default: Date.now()
        }
    }
});
orgsSchema.virtual('date').get(function(){
    var m,d;
    if(this.month<10){
        m='0'+this.month;
    }
    if(this.day<10){
        d='0'+this.day;
    }
    return this.year+'-'+m+'-'+this.day;
});
orgsSchema.statics = {
    fetch: function(cb) { //查询所有数据
        console.log(cb);
        return this
            .find()
            .sort('meta.updateAt') //排序
            .exec(cb) //回调
    },
    findById: function(id, cb) { //根据id查询单条数据
        return this
            .findOne({_id: id})
            .exec(cb)
    }
}
orgsSchema.set('toJSON',{getters:true,virtual:true});
//products
var drugsSchema=new mongoose.Schema({
    institution: String,
    name:String,
    pid:String,
    specifications:String,
    unit:String,
    amountOfPurchased:Number,
    amountOfSales: Number,
    volumeOfSales:Number,
    month:Number,
    meta: {
        createAt: {
            type: Date,
            default: Date.now()
        },
        updateAt: {
            type: Date,
            default: Date.now()
        }
    }
});
drugsSchema.virtual('institution.title').get(function(){
    return '机构名称';
});
drugsSchema.virtual('name.title').get(function(){
    return '产品名';
});
drugsSchema.virtual('pid.title').get(function(){
    return '产品id';
});
drugsSchema.virtual('specifications.title').get(function(){
    return '规格';
});
drugsSchema.virtual('unit.title').get(function(){
    return '单位';
});
drugsSchema.virtual('amountOfPurchased.title').get(function(){
    return '采购量';
});
drugsSchema.virtual('amountOfSales.title').get(function(){
    return '销售总量';
});
drugsSchema.virtual('volumeOfSales.title').get(function(){
    return '销售金额（元）';
});
drugsSchema.pre('save', function(next) {
    if(this.isNew) {
        this.meta.createAt = Date.now();
        this.meta.updateAt = this.meta.createAt;
    }else {
        this.meta.updateAt = Date.now();
    }
    next();
});
drugsSchema.statics = {
    fetch: function(cb) { //查询所有数据
        console.log(cb);
        return this
            .find()
            .sort('meta.updateAt') //排序
            .exec(cb) //回调
    },
    findById: function(id, cb) { //根据id查询单条数据
        return this
            .findOne({_id: id})
            .exec(cb)
    }
}
module.exports.UsersSchema = UsersSchema;
module.exports.orgsSchema = orgsSchema;
module.exports.drugsSchema = drugsSchema;