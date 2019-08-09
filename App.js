const express = require('express');
const parser = require('body-parser');
const bunyan = require('bunyan');
const debug = require('debug');
const fs = require('fs');
const lowdb = require('lowdb');
const fileAsync= require('lowdb/adapters/FileAsync');
const service2 = require('./service2.js');
const fork = require('child_process');
const config = require('dotenv').config();
const http = require('http');
const cors = require('cors');

if(config.error)
{
    throw config.error;
}

const app = express();
const env = process.env.NODE_ENV || 'dev' ;
process.env.UV_THREADPOOL_SIZE = process.env.MAX_THREAD_POOL_SIZE;

console.log(`Node env : ${ env} running on process :${ process.pid } and working directory ${ process.cwd() }  and number of process ${process.env.MAX_THREAD_POOL_SIZE}`);

const service1 = fork.fork('service1.js');
service1.on('message',(msg)=>{
    console.log('message from child ',msg);
});
service1.send({hello : 'App fork'});
service2.hello();

const adapter = new fileAsync('employee.json');
const employeeDb = lowdb(adapter);

const logger = bunyan.createLogger({name: "Server Log"});
app.locals.appname = 'My Sample APP';

debug('booting server');
var myLogger = (req,res,next)=>{
    logger.info(`new request on : ${ Date.now()}`);
    next();
};

app.use(cors());
app.use('/public', express.static(process.cwd() + '/public'));
app.set('view engine','ejs');
app.use(myLogger);
app.use(parser.json());
app.use(parser.urlencoded({extended:true}));
app.get('/', (req,res)=>{
     //res.status(200).send('Hello world agian');
     res.render('index');
     debug("Hiting home page");
    });
app.get('/user/:name',(req,res)=> res.send(`hello ${ req.params.name }`))
app.get('/search',(req,res)=> res.send(`name ${req.param('name')}`));
app.get('/employee',(req,res)=> {
   const employeeName = req.param('name');
    if(employeeName!= undefined )
    {
        const result = employeeDb.get('employee').find({name:employeeName}).value();
        res.send(result);
    }
    else
    {
        res.send(JSON.parse(fs.readFileSync('employee.json')));
    }
});
app.post('/adduser',(req,res)=> {
    var name = req.body.name;
    res.send(`new user ${ name } added`);
});

app.get('/weather',(req,res)=>{
var data='';

http.get('http://api.openweathermap.org/data/2.5/group?id=2643743,2988507,745044,6539761,3117735&units=metric&appid=7c0fd0373bae36358d64d9daa0b8cdcb',(wResp)=>{


wResp.on('data',(chunk)=>{
    data+=chunk;
});

wResp.on('end',()=>{
    res.status(200).send(JSON.parse(data));
});

}).on('error', (err)=>{
    logger.error(`error when fetching data from weather api ${ err.stack }`);
});

});

process.on('uncaughtException',(err)=>{
    logger.error(` Caught exception: ${err}`);
});
let port= process.env.port || 3000
app.listen(port,'localhost',()=> debug(`listening ${ port }`));
