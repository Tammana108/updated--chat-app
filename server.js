const path = require('path');
const express = require('express');
const http= require('http');
const socketio = require('socket.io');
const formatMessage=require('./utils/message');
const {userJoin,getCurrentUser,userLeave,getRoomUsers}=require('./utils/users');
const app=express();
const server=http.createServer(app);
const io=socketio(server);

//set server static
app.use(express.static(path.join(__dirname,'public')));
const botName='Bot Head';
//when client connects
io.on('connection',socket =>{
    socket.on('joinRoom',({username,room})=>
    {
        const user=userJoin(socket.id,username,room);
        socket.join(user.room);
        socket.emit('message',formatMessage(botName,'Welcome to ChatApp!'));
        //broadcast
            socket.broadcast.to(user.room).emit('message',formatMessage(botName,`${user.username} has joined!`));
   
        //send user and room info
        io.to(user.room).emit('roomUsers',{
            room:user.room,
            users:getRoomUsers(user.room)
        });
        });
  

 //chat messages
 socket.on('chatMessage',msg=>
 {
    const user=getCurrentUser(socket.id);
     io.to(user.room).emit('message',formatMessage(user.username,msg));
 });
 //disconnect message
 socket.on('disconnect',()=>{
     const user=userLeave(socket.id);
     if(user)
     {
        io.to(user.room).emit('message',formatMessage(botName,`${user.username} has left the chat!`));
     
     //send user and room info
     io.to(user.room).emit('roomUsers',{
        room:user.room,
        users:getRoomUsers(user.room)
    });
}
   
});

});
const PORT = process.env.PORT || 3000;

server.listen(PORT,()=> console.log(`Server running on Port ${PORT}`))



