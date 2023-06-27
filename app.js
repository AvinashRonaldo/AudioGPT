const express = require('express');
const cors = require('cors');
const socketio = require('socket.io');
const http = require('http');
const {Configuration,OpenAIApi} = require('openai');
require('dotenv').config();


const app = express()
app.use(express.json());
app.use(cors());
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
    const completion = await openai.createChatCompletion({
        model:'gpt-3.5-turbo',
        messages:[{role:"user",content:text}],
        max_tokens:50
    }); 
    console.log(completion.data.choices[0]);
    const reply = completion.data.choices[0].message.content;
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

server.listen(process.env.PORT,()=> {
    console.log("Server started on port 7000");
})



