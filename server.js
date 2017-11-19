const express = require('express')
const bodyParser = require('body-parser')
const { MongoClient} = require('mongodb')
const redis = require('redis')

const redisConfig = {
    port : '6379',
    host: '192.168.99.100'
}
const client = redis.createClient(redisConfig.port,redisConfig.host)

client.on('connect',()=>{
    console.log('redis is connected.')
})

const app = express()
const port = 3000

const mongodbName = 'register'
const mongodbUrl = 'mongodb://192.168.99.100:27017/'+mongodbName

const collectionUser = 'users'

let db

app.use(bodyParser.urlencoded({extended:true}))
app.use(bodyParser.json())

//Get user list
app.get('/users',(req,res)=>{
    const keyGetUsers = 'userlist'
    
    client.get(keyGetUsers,(err,result)=>{
        if(err){
            console.log('redis get err->',err)
        }else if(!result){
            db.collection(collectionUser).find().toArray((err,results)=>{
                if(err){
                    console.log('user list err.')
                }
        
                //Get user list from Redis
                client.set(keyGetUsers,JSON.stringify(results),(err,result)=>{
                    if(err){
                        console.log('ridis err->',err)
                    }
                })
        
                res.send(results)
            })
        }else{
            res.send(JSON.parse(result))
        }
    })

    
})


//Add new User
app.post('/users',(req,res)=>{
    db.collection(collectionUser).save(req.body,(err,results)=>{
        if(err){
            console.log('save user err->',err)
        }
        console.log('user has been saved.')
        res.send('user has been saved.')
    })
    res.send(req.body)
})

MongoClient.connect(mongodbUrl,(err,database)=>{
    if(err){
        console.log('err->',err)
    }

    db = database

    console.log('connect to database is successfuly.')

    app.listen(port,()=>{
        console.log('app listen on port '+port)
    })
})
