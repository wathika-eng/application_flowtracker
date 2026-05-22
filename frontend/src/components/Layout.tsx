import { useState, useEffect } from 'react'
import { useNavigate, Outlet } from 'react-router-dom'

export default function Layout() {
  const navigate = useNavigate()
  const [dark, setDark] = useState(() => {
    if (typeof window === 'undefined') return false
    return document.documentElement.classList.contains('ios-dark')
  })

  useEffect(() => {
    localStorage.setItem('flowtracker-dark', String(dark))
    document.documentElement.classList.toggle('ios-dark', dark)
    document.documentElement.style.colorScheme = dark ? 'dark' : 'light'
  }, [dark])

  function toggleDark() {
    setDark((prev) => !prev)
  }

  return (
    <div className="ios-page">
      <nav className="ios-nav">
        <div className="ios-nav-inner">
          <div className="ios-nav-left">
            <button className="ios-nav-btn" onClick={() => navigate('/')}>
              Applications
            </button>
          </div>
          <div className="ios-nav-title">FlowTracker</div>
          <div className="ios-nav-right">
            <button
              className="ios-nav-btn"
              onClick={toggleDark}
              title={dark ? 'Switch to light mode' : 'Switch to dark mode'}
              style={{ fontSize: 20, lineHeight: 1 }}
            >
              {dark ? '\u2600\uFE0F' : '\uD83C\uDF19'}
            </button>
            <button
              className="ios-nav-btn ios-nav-btn-bold"
              onClick={() => navigate('/applications/new')}
            >
              New
            </button>
          </div>
        </div>
      </nav>
      <div className="ios-container">
        <Outlet />
      </div>
    </div>
  )
}
