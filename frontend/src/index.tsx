import React from 'react'
import ReactDOM from 'react-dom'
import './index.css'
import reportWebVitals from './reportWebVitals'
import { BrowserRouter, Routes, Route } from 'react-router-dom'

import { UserSessionProvider } from './context/UserSession'

import Home from './components/Home'
import PageLayout from './components/PageLayout'
import LogIn from './components/LogIn'
import Account from './components/Account'

ReactDOM.render(
  <React.StrictMode>
    <BrowserRouter>
      <UserSessionProvider>
        <Routes>
          <Route element={<PageLayout />}>
            <Route path="/" element={<Home />}></Route>
            <Route path="/log-in" element={<LogIn />}></Route>
            <Route path="/account" element={<Account />}></Route>
          </Route>
        </Routes>
      </UserSessionProvider>
    </BrowserRouter>
  </React.StrictMode>,
  document.getElementById('root')
)

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals()
