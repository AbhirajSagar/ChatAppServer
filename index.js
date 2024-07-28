const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const port = process.env.PORT || 5000;
const app = express();
const server = http.createServer(app);
const io = new Server(server, 
{
    cors: 
    {
        origin: "*",
        methods: ["GET", "POST"],
    }
});

let waitingUsers = [];
app.use(express.json());


io.on('connection', socket => 
{
    console.log('A user connected with Id :' + socket.id);
    socket.on('get-partner',()=>
    {
        if(waitingUsers.length > 0)
        {
            const partner = waitingUsers.pop();
            socket.join(partner.id);

            socket.emit('user-connected',partner.id);
        
            socket.on('disconnect', () => 
            {
                partner.emit('user-disconnected', socket.id);
                console.log('A user disconnected with Id :' + socket.id);
                
                waitingUsers = waitingUsers.filter(user => user.id !== socket.id);
            });
            socket.on('ice-candidate', (userId, iceCandidate) => 
            {
                partner.emit('ice-candidate', userId, iceCandidate);
            });
            socket.on('offer', (userId, offer) => 
            {
                partner.emit('offer', userId, offer);
            });
            socket.on('answer', (userId, answer) => 
            {
                partner.emit('answer', userId, answer);
            });
        }
        else
        {
            waitingUsers.push(socket);
        }

        console.log(waitingUsers);
    });
});

server.listen(port, () => 
{
    console.log(`Server is running on http://localhost:${port}`);
});