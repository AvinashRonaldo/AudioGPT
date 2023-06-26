const express = require('express');
const cors = require('cors');
const socketio = require('socket.io');
const http = require('http');
const {Configuration,OpenAIApi} = require('openai');
require('dotenv').config();

const app = express()
app.use(express.static('public'));
app.use(express.static(__dirname + '/views')); 
app.use(express.static(__dirname + '/public'));

const server = http.createServer(app);
const io = socketio(server);

app.use(express.json());
const configuration = new Configuration({
    apiKey:process.env.OPENAI_API_KEY
})

const openai = new OpenAIApi(configuration);

async function generate_response(text){
    const completion = await openai.createCompletion({
        model:'text-davinci-003',
        prompt:text,
        temperature:0.4
    }); 
    const reply = completion.data.choices[0].text;
    return reply;
}

io.on('connection',(socket)=>{
    console.log("User Connected")
    socket.on('voice',async(transcript) =>{
        console.log('Transcript:', transcript);
        const result = await generate_response(transcript);
        socket.emit("reply",result);
    })
    socket.on('disconnect',() => {
        console.log("User disconnected!");
    })
});

app.get("/",(req,res) => {
    res.send('index.html');
})

server.listen(7000,()=> {
    console.log("Server started on port 7000");
})



