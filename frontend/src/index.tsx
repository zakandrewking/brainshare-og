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
import { TableView, TableDetail } from './components/Table'
import UploadDetail from './components/UploadDetail'
import PrepareBase from './components/PrepareBase'

// in development, auto-log-in
if (process.env.NODE_ENV === 'development') {
  const email = process.env.REACT_APP_TEST_USER_EMAIL
  const password = process.env.REACT_APP_TEST_USER_PASSWORD
  const supabase = require('./api/supabaseClient').default
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
            <Route
              path="/uploads"
              element={<TableView tableName="uploaded_files" />}
            />
            <Route path="/uploads/:id" element={<UploadDetail />} />
            <Route path="/uploads/:id/prepare-base" element={<PrepareBase />} />
            <Route path="/bases" element={<TableView tableName="bases" />} />
            <Route
              path="/bases/:id"
              element={<TableDetail tableName="bases" />}
            />
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
