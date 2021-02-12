import React, {useContext, useEffect, useState} from 'react'
import { AuthContext } from '../context/AuthContext'
import { useHttp } from '../hooks/http.hook'
import {useMessage} from '../hooks/message.hook'

export const AuthPage = () => {
  const auth = useContext(AuthContext)
  const message = useMessage()
  const {loading, request, error, clearError} = useHttp()
  const [form, setForm] = useState({email:'', password:''})


  useEffect(()=>{
    message(error)
    clearError()
  }, [error, message, clearError])

  const changeHandler = event => {
    setForm({...form, [event.target.name]: event.target.value})
  }
  const registerHandler = async () => {
    try {
      const data = await request('/api/auth/register', 'POST', {...form})
      message(data.message)
    } catch (e) {}
  }

  const loginHandler = async () => {
    try {
      const data = await request('/api/auth/login', 'POST', {...form})
      auth.login(data.token, data.userId)
    } catch (e) {}
  }


  return (
    <div id="main-container" className="container-fluid">
    <div className="row">
        <div id="auth-form" className="card border-primary">
        <h5 className="card-header bg-primary text-white">Online Checkers</h5>
        <div className="card-body">
            <form className="panel-body">
            <div className="input-group">
                <input 
                    type="text" 
                    id="login" 
                    name="email"
                    className="form-control" 
                    placeholder="Email"
                    onChange={changeHandler}
                />
            </div>
            <div className="input-group">
                <input 
                    type="password" 
                    id="password"
                    name="password" 
                    className="form-control" 
                    placeholder="Password"
                    onChange={changeHandler}
                />
            </div>
            <div className="buttons-group">
                <button 
                    type="button" 
                    className="btn btn-primary"
                    disabled={loading}
                    onClick={loginHandler}
                >
                    Login</button>
                <button 
                    type="button"
                    className="btn btn-primary"
                    onClick={registerHandler}
                    disabled={loading}
                >Register</button>
            </div>
            </form>
        </div>
        </div>
    </div>
    </div>
  )
}
