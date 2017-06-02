var express = require('express');
var router = express.Router();
var fs = require('fs');
var formidable = require('formidable');
var path = require('path');
var csv=require('../csv');
var dbModel = require('../model/reportForms');

/* GET home page. */
router.get('/', function(req, res, next) {
    //promise方法，多次查询数据库
    var getDatas=[dbModel.drugsModel.find( {},'-_id institution name amountOfPurchased amountOfSales volumeOfSales month').exec(),
                  dbModel.orgsModel.find({},'-_id year month day institution outpatient').exec()];
    Promise.all(getDatas).then(function(datas){
        console.log('----------promose------');
        res.render('index', {
            title: 'Excel文件处理',
            dataOfChart4:JSON.stringify(datas[0]),
            dataOfChart1:JSON.stringify(datas[1]),
        });
    });
    //原回调金字塔方法：
  /*  dbModel.drugsModel.find( {},'-_id institution name amountOfPurchased amountOfSales volumeOfSales month',function (err, data) {
        if (err) {
            console.log(err);
        }
        var data04 = JSON.stringify(data);
        console.log(data04);
        dbModel.orgsModel.find({},'-_id year month day institution outpatient',function (err,data) {
            if (err) {
                console.log(err);
            }
          //  console.log(data);
            var data01 = JSON.stringify(data);
            res.render('index', {
                title: 'Excel文件处理',
                dataOfChart4:data04,
                dataOfChart1:data01,
            });

        })
    })*/
});

router.get('/upload', function(req, res, next) {
    res.render('upload', { title: '文件上传' });
});
router.post('/upload', function(req, res, next) {
    var csvpath=path.resolve(__dirname, '..')+'/public/csv/';
    var form = new formidable.IncomingForm();
    form.encoding = 'utf-8';		//设置编辑
    form.uploadDir = 'public/csv/';	 //设置上传目录
    form.keepExtensions = true;	 //保留后缀
    form.maxFieldsSize = 20 * 1024 * 1024;   //文件大小
    form.multiples=true;
    form.parse(req, function(err, fields, files) {
        if (err) {
            res.send(err);
            console.log("err form line 72:"+err);
            return;
        }
        //console.log(files);
        for(var key in files){
            var avatarName=key;
            var newPath=form.uploadDir + avatarName;
            console.log(files[key].path);
            fs.renameSync(files[key].path,newPath);
            if(/^drugs/.test(avatarName)){
                var monthNumber=avatarName.match(/[0|1][0-9](?=-)/)?avatarName.match(/[0|1][0-9](?=-)/)[0]*1:1;
                var count=0;
                csv.each(csvpath+avatarName).on('data',function(data){
                    count++;
                    console.log(count+':'+data);
                    if(count>0){
                        var item=new dbModel.drugsModel({
                            institution: data[0],
                            name:data[1],
                            pid:data[2],
                            specifications:data[3],
                            unit:data[4],
                            amountOfPurchased:data[5],
                            amountOfSales: data[6],
                            volumeOfSales:data[7],
                            month:monthNumber,
                        });
                        item.save();
                    }
                }).on('end',function () {
                    console.log('End! ');
                });
            }
            if(/^orgs/.test(avatarName)){
                var count=0;
                csv.each(csvpath+avatarName).on('data',function(data){
                    count++;
                    console.log(count+':'+data);
                    if(count>0){
                        var item=new dbModel.orgsModel({
                            institution: data[0],
                            year: data[1],
                            month: data[2],
                            day: data[3],
                            outpatient:{
                                income1:data[4],income2:data[5],income3:data[6],income4:data[7],income5:data[8],income6:data[9],income7:data[10],
                                income8:data[11],income9:data[12],income10:data[13],income11:data[14],income12:data[15],income13:data[16],income14:data[17],
                                income15:data[18],income16:data[19],income17:data[20],income18:data[21],income19:data[22],income20:data[23],income21:data[24],
                            },
                            person:{
                                numbers1:data[25], numbers2:data[26], numbers3:data[27], numbers4:data[28], numbers5:data[29], numbers6:data[30], numbers7:data[31],
                                numbers8:data[32], numbers9:data[33], numbers10:data[34], numbers11:data[35], numbers12:data[36], numbers13:data[37], numbers14:data[38]
                            }
                        });
                        item.save();
                    }
                }).on('end',function () {
                    console.log('End! ');
                });
            }
        }
        res.end();
    });

});
module.exports = router;
