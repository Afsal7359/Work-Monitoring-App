import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import { HashRouter as Router, Route } from 'react-router-dom'

import Home from "./App"
import Sidebar from './Components/Sidebar/Sidebar';
import Login from './Components/Login/Login';



ReactDOM.render(
    <Router>
      
            <main>
                
                <Route exact path="/" component={Home} />
                <Route path='/login' component={Login}/>
         
            </main>
    </Router>, 
    document.getElementById("root")
    
)
