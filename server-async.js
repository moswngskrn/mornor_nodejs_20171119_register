const express = require('express')
const bodyParser = require('body-parser')
const { MongoClient} = require('mongodb')
const redis = require('redis')
const Promise = require('bluebird')

const redisConfig = {
    port : '6379',
    host: '192.168.99.100'
}
const client = Promise.promisifyAll(redis.createClient(redisConfig.port,redisConfig.host))


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

const keyGetUsers = 'userlist'

//Get user list
app.get('/users',async (req,res) => {
    try{
        const result = await client.getAsync(keyGetUsers)
        if(!result){
            const dbResult = await db.collection(collectionUser).find().toArray()
            client.set(keyGetUsers,JSON.stringify(dbResult))
            res.send(dbResult)
            return
        }
        res.send(JSON.parse(result))
    }catch(err){
        console.log('err->',err)
    }
})


//Add new User
app.post('/users',async (req,res)=>{
    try{
        const result = await db.collection(collectionUser).save(req.body)
        console.log('user has been added.')
        await client.delAsync(keyGetUsers)
        console.log('redis key removed.')

        res.send(result)
    }catch(err){
        console.log('add users err ->',err)
    }
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
