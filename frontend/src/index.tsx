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
import Uploads from './components/Uploads'
import DatabaseList from './components/DatabaseList'
import DatabaseView from './components/DatabaseView'

// in development, auto-log-in
if (process.env.NODE_ENV === 'development') {
  const email = process.env.REACT_APP_TEST_USER_EMAIL
  const password = process.env.REACT_APP_TEST_USER_PASSWORD
  const { supabase } = require('./api/supabaseClient')
  const session = supabase.auth.session()
  console.log('Session', session)
  if (!session) {
    supabase.auth
      .signUp({
        email: 'test@test.com',
        password: 'password'
      })
      .then(() => {
        supabase.auth.signIn({ email, password }).then((res: any) => {
          console.log('Auto log in result', res)
        })
      })
  }
}

ReactDOM.render(
  <React.StrictMode>
    <BrowserRouter>
      <UserSessionProvider>
        <Routes>
          <Route element={<PageLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/log-in" element={<LogIn />} />
            <Route path="/account" element={<Account />} />
            <Route path="uploads" element={<Uploads />} />
            <Route path="/database" element={<DatabaseList />} />
            <Route path="/database/:databaseId" element={<DatabaseView />} />
            <Route path="*" element={<p>Nothing here!</p>} />
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
