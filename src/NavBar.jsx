import React from 'react'
import { Link } from 'react-router-dom'

export default function NavBar() {
    return (
        <nav className="app-nav">
            <Link to="/">Join</Link>
            <Link to="/manual">Manual</Link>
            <Link to="/new">About</Link>
        </nav>
    )
}