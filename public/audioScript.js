  'use strict'

const socket = io()
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const SpeechGrammarList =
  window.SpeechGrammarList || window.webkitSpeechGrammarList;
const recognition = new SpeechRecognition();
const speechRecognitionList = new SpeechGrammarList();
const endButton = document.getElementById('end');

recognition.lang = 'en-IN'
recognition.continous = false;
recognition.maxAlternatives = 1;

document.querySelector('button').addEventListener('click',() => {
    recognition.start();
})

endButton.onclick= () => {
    console.log("Stopping Voice Recognition");
    addMessage('Stopping Service');
    recognition.stop()
}

recognition.onspeechstart = () => {
    console.log("Speech has started!")
}

recognition.onend = () => {
    console.log("Restarting Speech Recognition");
    recognition.start()
}

recognition.onnomatch = () => {
    console.log("No Match")
}

recognition.addEventListener('result',(e)=> {
    console.log("Processing"); 
    let last = e.resultIndex;
    let text = e.results[last][0].transcript;
    console.log("Text said is",text);
    addMessage(text);
    socket.emit('voice',text);
});




function synthVoice(text){
    const synth = window.speechSynthesis;
    const utterance = new SpeechSynthesisUtterance();
    utterance.text = text;
    synth.speak(utterance);
}
socket.on('reply',(reply)=> {
    synthVoice(reply);
    if(reply=='') reply = 'No answer';
    addMessage(reply);
})

function addMessage(msg){
    var convo = document.getElementById('conversation')
    var newEl = document.createElement('li')
    var textNode = document.createTextNode(msg);
    newEl.appendChild(textNode);
    console.log(newEl);
    convo.appendChild(newEl);
    convo.scrollTop = convo.scrollHeight;
}