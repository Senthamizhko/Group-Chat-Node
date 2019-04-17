const users=[]

//adduser

const addUser = ({id,username,room})=>{
    //Clean the data
    username = username.trim().toLowerCase()
    room = room.trim().toLowerCase()

    //validate the data
    if(!username || !room){
        return{
            error: 'Please out username and room'
        }
    }

    //check if it is a existing user

    const existingUser = users.find((user) =>{
       return user.username === username && user.room === room 
    })

    if (existingUser){
        return{
            error: 'User is in use'
        }
    }
    const user={id,username,room}
    users.push(user)
    return {user}
}

const removeUser = (id) =>{
    const index = users.findIndex((user)=>{  //finds the position -1 for no results and 0,1 for availablity
        return user.id === id
    })

    if(index != -1){
       return users.splice(index,1)[0]
    }   
}

const getUser = (id)=>{
    const index = users.find((user)=>{
        return user.id === id
    })
    if (!index){
        return undefined
    }
    return index
}
  
const getUserInRoom = (room)=>{
    room = room.trim().toLowerCase()
    const index = users.filter((user)=>{
        return user.room === room
    })
    if (!index){
        return undefined
    }
    return index
    
}

module.exports={
    addUser,
    removeUser,
    getUser,
    getUserInRoom
}