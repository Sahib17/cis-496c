import React from 'react'
import { Link } from 'react-router-dom'

const Navbar = () => {
  return (
    <div className="flex items-center justify-between px-8 py-4 border-b">
  <Link to="/" className="text-xl font-bold">
    Splitr
  </Link>

  <ul className="flex gap-8 font-medium">
    <li>Hey</li>
    <li>Hi</li>
  </ul>
</div>
  )
}

export default Navbar