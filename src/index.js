const express = require('express')
const socketio = require('socket.io')
const path = require('path')
const http = require('http')
const Filter = require('bad-words')
const {generateMessage,generateLocationMessage}= require('./utils/messages')
const {addUser,removeUser,getUser,getUserInRoom } = require('./utils/users')

const app = express()
const server = http.createServer(app)
const io = socketio(server)

const port = process.env.PORT|| 3001
const public = path.join(__dirname,'../public')

app.use(express.static(public))

io.on('connection',(socket)=>{  //connection is the default tag 
                                                //EMIT sends message // ON receives the message withbthe same name as emit
    console.log('New web client connection')  
 //   socket.emit('message',generateMessage('Welcome!'))
 //   socket.broadcast.emit('message',generateMessage('New user joined the chat room')) //broadcast sends msg to all users except us

    socket.on('join',({username,room},callback)=>{

        const {error, user}= addUser({id:socket.id, username, room})
        if(error){
            return callback(error)
        }
        
        socket.join(user.room)     //only on server side to join the specific room
        //socket.emit socket.broadcast.emit io.emit
        //            socket.broadcast.to.emit io.to.emit  >specific to rooms
        socket.emit('message',generateMessage('Admin','Welcome!'))
        socket.broadcast.to(user.room).emit('message',generateMessage('Admin', user.username +  ' joined the chat room'))
        callback()
        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUserInRoom(user.room)
        })
    })

    socket.on('inputmessage',(message,callback)=>{
        const filter = new Filter()  //Check the profanity of the message
        if(filter.isProfane(message)){
           return callback('Profanity is not allowed')
        }
        const user = getUser(socket.id)
        io.to(user.room).emit('message',generateMessage(user.username,message)) // send msg to all users including us
        callback('Message delivered')
    })

    socket.on('sendLocation',(location,callback)=>{
        const user = getUser(socket.id)
        io.to(user.room).emit('locationmessage',generateLocationMessage(user.username,location.latitude,location.longitude))
        callback('Location shared!!')
    })
    socket.on('disconnect',()=>{            //disconnect is a default tag when the socket listens the disconnection, it emits message to all users
       const user = removeUser(socket.id)
        
        if (user){
            io.to(user.room).emit('message',generateMessage('Admin',user.username+' has left the chat room')) 
            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUserInRoom(user.room)
            })
        }       
})
    
})

server.listen(port,()=>{
    console.log('Port is up running at ' + port)
})