const socket = io()

//elements, we kept the belopw elements for easily pointing them to perform for example setattributes,removeattributes

const $clientForm = document.querySelector('#client')
const $inputmessage = $clientForm.querySelector('input')
const $inputbutton = $clientForm.querySelector('button')
const $inputlocation = document.querySelector('#send-location')
const $messages = document.querySelector('#messages')

//templates
const messageTemplate = document.querySelector('#message-template').innerHTML   
const locationTemplate = document.querySelector('#location-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

//options
const {username,room}= Qs.parse(location.search,{ignoreQueryPrefix: true})
//1-send Message
socket.on('message',(message)=>{
    
    const html = Mustache.render(messageTemplate,{  //rendering the message received-- Mustache.render(template,message)
        username:message.username,
        message: message.text,
        createdAt: moment(message.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend',html) //inserting the rendered html message inside the DIV tag
})
//2-send-location

socket.on('locationmessage',(url)=>{
    const html = Mustache.render(locationTemplate,{
     username :url.username,
     message: url.url,
     createdAt : moment(url.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend',html)
})
//3-room data

socket.on('roomData',({room,users})=>{
   const html = Mustache.render(sidebarTemplate,{
       room : room,
       users: users
   }) 
   document.querySelector('#sidebar').innerHTML = html

   
})
$clientForm.addEventListener('submit',(e)=>{
    e.preventDefault()
    $inputbutton.setAttribute('disabled','disabled') //to disable the send button once message sent
 //   const message = document.querySelector('input').value    //One way of getting inout message from the input tag
    const message = e.target.elements.message.value //e has the value, target points to the form and targets the one of the element with name='message

    socket.emit('inputmessage',message,(acknowledge)=>{ //third argument callback is for event acknowledgement
        console.log(acknowledge)
        $inputbutton.removeAttribute('disabled') //to enable the send button once message is delivered
        $inputmessage.value = ''  //to clear out the input message once msg delivered
        $inputmessage.focus()   // bring back the focus to the message bar once we clicked the send button
    })

})
$inputlocation.addEventListener('click',()=>{
    
    if(!navigator.geolocation){
        return alert('Geolocation is not supported by your browser')
    }
    $inputlocation.setAttribute('disabled','disabled')
    
    navigator.geolocation.getCurrentPosition((position)=>{ //getCurrentPosition function is synchronous so promise,async,awit is not supported, it returns the position object
      //  console.log(position)
        socket.emit('sendLocation',{
            latitude :position.coords.latitude,
            longitude:position.coords.longitude
        },(acknowledge)=>{
            console.log(acknowledge)
            $inputlocation.removeAttribute('disabled')
        })
    })
})


socket.emit('join',{username,room},(error)=>{
    if(error){
        alert(error)
        location.href='/'
    }

})