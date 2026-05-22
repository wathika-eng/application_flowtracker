import { useState, useEffect } from 'react'
import { useNavigate, Outlet } from 'react-router-dom'

function getInitialDark(): boolean {
  if (typeof window === 'undefined') return false
  const stored = localStorage.getItem('flowtracker-dark')
  const isDark = stored !== null ? stored === 'true' : window.matchMedia('(prefers-color-scheme: dark)').matches
  document.documentElement.classList.toggle('ios-dark', isDark)
  document.documentElement.style.colorScheme = isDark ? 'dark' : 'light'
  return isDark
}

export default function Layout() {
  const navigate = useNavigate()
  const [dark, setDark] = useState(getInitialDark)

  useEffect(() => {
    localStorage.setItem('flowtracker-dark', String(dark))
    document.documentElement.classList.toggle('ios-dark', dark)
    document.documentElement.style.colorScheme = dark ? 'dark' : 'light'
  }, [dark])

  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = (e: MediaQueryListEvent) => {
      if (localStorage.getItem('flowtracker-dark') === null) {
        setDark(e.matches)
      }
    }
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

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
