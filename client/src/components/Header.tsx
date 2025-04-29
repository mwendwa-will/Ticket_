import { Link } from "wouter";

const Header = () => {
  return (
    <header className="bg-gray-800 text-white shadow-md">
      <nav className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/">
          <a className="text-xl font-bold">TicketMaster</a>
        </Link>
        <ul className="flex space-x-6">
          <li>
            <Link href="/">
              <a className="hover:text-blue-300">Home</a>
            </Link>
          </li>
          <li>
            <Link href="/?category=all">
              <a className="hover:text-blue-300">Events</a>
            </Link>
          </li>
          <li>
            <Link href="/?category=genres">
              <a className="hover:text-blue-300">Genres</a>
            </Link>
          </li>
          <li>
            <Link href="/login">
              <a className="hover:text-blue-300">Sign In</a>
            </Link>
          </li>
        </ul>
      </nav>
    </header>
  );
};

export default Header;
