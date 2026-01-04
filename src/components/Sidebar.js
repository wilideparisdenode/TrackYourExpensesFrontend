import { NavLink } from "react-router-dom";
import { 
  BarChartFill,
  WalletFill,
  CurrencyExchange,
  CashStack,
  FolderFill,
  GraphUp,
  PeopleFill,
  ChevronLeft,
  ChevronRight,Gear
} from "react-bootstrap-icons";
import "./Sidebar.css";

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const menuItems = [
     { path: "/settings", label: "settings", icon: <Gear className="sidebar-icon" /> },
    { path: "/dashboard", label: "Dashboard", icon: <BarChartFill className="sidebar-icon" /> },
    { path: "/budgets", label: "Budgets", icon: <WalletFill className="sidebar-icon" /> },
    { path: "/expenses", label: "Expenses", icon: <CurrencyExchange className="sidebar-icon" /> },
    { path: "/income", label: "Income", icon: <CashStack className="sidebar-icon" /> },
    { path: "/categories", label: "Categories", icon: <FolderFill className="sidebar-icon" /> },
    // { path: "/expense_category", label: "ExpenseCategory", icon: <FolderFill className="sidebar-icon" /> },
    { path: "/reports", label: "Reports", icon: <GraphUp className="sidebar-icon" /> },
    { path: "/users", label: "Users", icon: <PeopleFill className="sidebar-icon" /> },
  ];

  return (
    <>
      <aside className={`sidebar ${isOpen ? "open" : "closed"}`}>
        <div className="sidebar-header">
          <h2 className="sidebar-title">
            <WalletFill className="sidebar-logo" />
            {isOpen && <span>Budget Manager</span>}
          </h2>
          <button className="sidebar-toggle" onClick={toggleSidebar}>
            {isOpen ? <ChevronLeft /> : <ChevronRight />}
          </button>
        </div>
        <nav className="sidebar-nav">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}
            >
              {item.icon}
              {isOpen && <span className="sidebar-label">{item.label}</span>}
            </NavLink>
          ))}
        </nav>
      </aside>
      <div className={`sidebar-overlay ${isOpen ? "active" : ""}`} onClick={toggleSidebar} />
    </>
  );
};

export default Sidebar;