import React from 'react'
import {Link} from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faMoneyBill, faBook, faBox, faRuler, faChartBar, faSignInAlt } from '@fortawesome/free-solid-svg-icons';
import './Sidebar.css';
function Sidebar() {
  return (
    
    <div className="navbar">
    <Link className="nav-link" to="/">
      <FontAwesomeIcon icon={faHome} />
      <span> Home</span>
    </Link>
    <Link className="nav-link" to="/billing">
      <FontAwesomeIcon icon={faMoneyBill} />
      <span> Billing</span>
    </Link>
    <Link className="nav-link" to="/ledger">
      <FontAwesomeIcon icon={faBook} />
      <span> Ledger</span>
    </Link>
    <Link className="nav-link" to="/product">
      <FontAwesomeIcon icon={faBox} />
      <span> Product</span>
    </Link>
    <Link className="nav-link" to="/uom">
      <FontAwesomeIcon icon={faRuler} />
      <span> UOM</span>
    </Link>
    <Link className="nav-link" to="/report">
      <FontAwesomeIcon icon={faChartBar} />
      <span> Report</span>
    </Link>
    <Link className="nav-link" to="/login">
      <FontAwesomeIcon icon={faSignInAlt} />
      <span> Login</span>
    </Link>
  </div>
  )
}

export default Sidebar