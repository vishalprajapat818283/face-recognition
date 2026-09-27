import { Link } from "react-router-dom";


function Navbar() {

  return (

    <nav className="navbar">

      <div className="navbar-container">

        <Link
          to="/"
          className="logo"
        >
          Face Recognition
        </Link>


        <div className="nav-links">

          <Link to="/">
            Home
          </Link>

          <Link to="/register">
            Register
          </Link>

          <Link to="/recognize">
            Recognize
          </Link>

          <Link to="/people">
            People
          </Link>

        </div>

      </div>

    </nav>

  );
}


export default Navbar;