import React from 'react'
import { useState } from 'react'

export default function NavBar() {
    const [ fix, setFix ]  = useState(false)

    function setFixed() {
        if (window.scrollY >= 200) {
            setFix(true)
        } else {
            setFix(false)
        }
    }

    window.addEventListener("scroll", setFixed)

    return(
        <header>
            <nav className={fix ? 'navBar fixed' : 'navBar'}>
                <a href="/" >
                    <img 
                        className = "templelogo" 
                        src = {fix ? "./T_red.png" : "./templelogo.png"} 
                    
                    />
                </a>
                <a href="/" className = "site-title">
                      Smart Schedule
                </a>
            </nav>
        </header>
        
    )
}