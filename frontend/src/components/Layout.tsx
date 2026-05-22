import { useNavigate, Outlet } from 'react-router-dom'

export default function Layout() {
  const navigate = useNavigate()

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
              className="ios-nav-btn ios-nav-btn-bold"
              onClick={() => navigate('/applications/new')}
            >
              New
            </button>
          </div>
        </div>
      </nav>
      <Outlet />
    </div>
  )
}
