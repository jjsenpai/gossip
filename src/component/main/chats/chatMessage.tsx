import { useRef, useState, useEffect } from "react"

import axios from 'axios';
import { useNavigate } from "react-router-dom"
import { ChatEngine } from 'react-chat-engine'

import { useAuth } from "../../../contexts/authContext";

import { auth } from "../../../firebase";

export default function ChatsRuntime() {
  const didMountRef = useRef(false)
  const [ loading, setLoading ] = useState(true)
  const { currentUser } = useAuth()
  const navigate = useNavigate()

  async function handleLogout() {
    await auth.signOut()
    navigate("/");
  }

  async function getFile(url) {
    let response = await fetch(url);
    let data = await response.blob();
    return new File([data], "test.jpg", { type: 'image/jpeg' });
  }

  useEffect(() => {
    if (!didMountRef.current) {
      didMountRef.current = true

      if (!currentUser || currentUser === null) {
        navigate("/");
        return
      }
      
      axios.get(
        'https://api.chatengine.io/users/me/',
        { headers: { 
          "project-id": '',
          "user-name": currentUser.email,
          "user-secret": currentUser.uid
        }}
      )

      .then(() => setLoading(false))

      .catch(e => {
        let formdata = new FormData()
        formdata.append('email', currentUser.email)
        formdata.append('username', currentUser.email)
        formdata.append('secret', currentUser.uid)

        getFile(currentUser.photoURL)
        .then(avatar => {
          formdata.append('avatar', avatar, avatar.name)

          axios.post(
            'https://api.chatengine.io/users/',
            formdata,
            { headers: { "private-key": process.env.REACT_APP_CHAT_ENGINE_KEY }}
          )
          .then(() => setLoading(false))
          .catch(e => console.log('e', e.response))
        })
      })
      // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

    }
  }, [currentUser, navigate])
  

  if (!currentUser || loading) return <div />

  return (
    <div className='chats-page'>
      <div className='nav-bar'>
        <div className='logo-tab'>
          Gossip
        </div>

        <div onClick={handleLogout} className='logout-tab'>
          Logout
        </div>
      </div>

      <ChatEngine 
        height='calc(100vh - 66px)'
        projectID=''
        userName={currentUser.email}
        userSecret={currentUser.uid}
      />
    </div>
  )
}