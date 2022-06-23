const express = require('express')
const app = express()
const MongoClient = require('mongodb').MongoClient
const cors = require('cors')
const { request } = require('http')
const PORT = 8000
require ('dotenv').config()


let db,
    dbConnectionStr = process.env.DB_STRING,
    dbName = 'cluster0'

MongoClient.connect(dbConnectionStr, { useUnifiedTopology: true })
.then(client => {
    console.log(`Connected to ${dbName} Database`)
    const db = client.db('songs-and-artists')
    const songCollection = db.collection('artists')
    app.set ('view engine','ejs')
    app.use(cors())
    app.use(express.urlencoded({ extended: true }))
    app.use (express.static('public'))
    app.use(express.json())
    
    app.get('/',(req,res)=>{
        songCollection.find().sort({likes: -1}).toArray()
        .then(data =>{
            console.log(data)
            res.render('index.ejs', {artists: data})
    })
    .catch(error => console.error(error))
    })

    app.post('/addSong', (req,res)=>{
        songCollection.insertOne({song: req.body.song, 
        artist: req.body.artist, likes: 0})
        .then(result => {
            console.log('Song Added')
            res.redirect('/')
        })
        .catch(error => console.error(error))
    })
    
    app.put('/addOneLike', (req,res)=>{
        songCollection.updateOne({song: req.body.songS, artist: req.body.artistS, likes: req.body.likesS},{
            $set: {
                likes:req.body.likesS +1
            }
        },{
            sort: {_id: -1},
            upsert: true
        })
        .then(result => {
            console.log('Added One Like')
            res.json('Like Added')
        })
        .catch(error=> console.error(error))
    })
    
    app.delete('/deleteSong',(req,res) => {
        songCollection.deleteOne({song: req.body.songS})
        .then(result =>{
            console.log('Song Deleted')
            res.json('Song Deleted')
        })
        .catch(error=>console.error(error))
    })
    
    app.listen(process.env.PORT || PORT, ()=>{
        console.log(`Server running on port ${PORT}`)
    })
})
.catch(error => console.error(error))    