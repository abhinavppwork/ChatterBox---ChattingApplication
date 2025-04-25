import React from 'react'
import Navbar from './components/Navbar'
import { Navigate } from 'react-router-dom'
import { Routes,Route } from 'react-router-dom'
import HomePage from "./pages/HomePage"
import Signup from "./pages/Signup"
import Login from "./pages/Login"
import Settings from "./pages/Settings"
import Profile from "./pages/Profile"
import { useAuthStore } from './store/useAuthStore'
import { useEffect } from 'react'
import Loader from './Loader'
import { Toaster } from 'react-hot-toast'
import { useThemeStore } from './store/useThemeStore'

const App = () => {
  const {authUser,checkAuth,isCheckingAuth,onlineUsers} = useAuthStore()
  const {theme} = useThemeStore()
  console.log({onlineUsers}); 
  useEffect(()=>{
    checkAuth()
  },[checkAuth])
  console.log({authUser});
  if(isCheckingAuth && !authUser) return (
    <div className="flex items-center justify-center min-h-screen">
      <Loader />
    </div>
  )
  return (
    <div data-theme = {theme}>
      <Navbar />
      <Routes>
        <Route path="/" element={authUser ? <HomePage/> : <Navigate to="/login"/>} />
        <Route path="/signup" element={!authUser ? <Signup/>: <Navigate to="/"/>} />
        <Route path="/login" element={!authUser ?<Login/>: <Navigate to="/"/>} />
        <Route path="/settings" element={<Settings/>} />
        <Route path="/profile" element={authUser ? <Profile/> : <Navigate to="/login"/>} />
      </Routes>
      <Toaster />
    </div>
    
  )
}

export default App
