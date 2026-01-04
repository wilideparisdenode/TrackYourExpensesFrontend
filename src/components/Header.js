"use client"
import { useAuth } from "../context/AuthContext"
import { List ,PersonFill} from "react-bootstrap-icons"
import "./Header.css"


const Header = ({ toggleSidebar }) => {
  const { user, logout } = useAuth()

  return (
    <header className="header">
      <div className="header-content">
        <div className="header-left">
          <button 
            className="sidebar-toggle-btn" 
            onClick={toggleSidebar}
            aria-label="Toggle sidebar"
          >
            <List className="menu-icon" />
          </button>
          <h1>Welcome back, {user?.name || "User"}!</h1>
        </div>
        <div className="header-right">
          <div className="user-info">
            <span className="user-avatar"> 
            {user.profileImage ? <img alt="profile-image" src={user.profileImage}></img>:<PersonFill/>}  
            </span>
            <span className="user-name">{user?.name}</span>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={logout}>
            Logout
          </button>
        </div>
      </div>
    </header>
  )
}

export default Header