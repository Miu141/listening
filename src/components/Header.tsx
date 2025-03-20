import { Link } from "react-router-dom";
import { useState } from "react";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="fixed top-0 left-0 right-0 bg-gradient-to-r from-primary-dark to-primary shadow-lg z-10">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link to="/" className="flex items-center">
          <div className="text-white font-bold text-2xl flex items-center">
            <svg
              className="w-8 h-8 mr-2"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 1.5C6.20156 1.5 1.5 6.20156 1.5 12C1.5 17.7984 6.20156 22.5 12 22.5C17.7984 22.5 22.5 17.7984 22.5 12C22.5 6.20156 17.7984 1.5 12 1.5Z"
                stroke="white"
                strokeWidth="2"
              />
              <path
                d="M12 6V12L16 16"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M8 14C7.5 13 7.5 11 8.5 10C9.5 9 11 9 12 10"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <path
                d="M16 14C16.5 13 16.5 11 15.5 10C14.5 9 13 9 12 10"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
            ListenMate
          </div>
        </Link>

        {/* PC用ナビゲーション */}
        <nav className="hidden md:flex space-x-6">
          <Link
            to="/privacy-policy"
            className="text-white hover:text-gray-200 transition"
          >
            プライバシーポリシー
          </Link>
          <Link
            to="/legal"
            className="text-white hover:text-gray-200 transition"
          >
            特定商取引法表記
          </Link>
          <Link
            to="/company"
            className="text-white hover:text-gray-200 transition"
          >
            運営者情報
          </Link>
          <Link
            to="/contact"
            className="text-white hover:text-gray-200 transition"
          >
            お問い合わせ
          </Link>
        </nav>

        {/* SPメニューボタン */}
        <button
          className="md:hidden text-white focus:outline-none"
          onClick={toggleMenu}
          aria-label="メニュー"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            {isMenuOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </button>
      </div>

      {/* SPメニュードロワー */}
      {isMenuOpen && (
        <div className="md:hidden bg-primary-dark">
          <div className="px-4 py-2 space-y-3">
            <Link
              to="/privacy-policy"
              className="block text-white hover:bg-primary-light px-3 py-2 rounded"
              onClick={() => setIsMenuOpen(false)}
            >
              プライバシーポリシー
            </Link>
            <Link
              to="/legal"
              className="block text-white hover:bg-primary-light px-3 py-2 rounded"
              onClick={() => setIsMenuOpen(false)}
            >
              特定商取引法表記
            </Link>
            <Link
              to="/company"
              className="block text-white hover:bg-primary-light px-3 py-2 rounded"
              onClick={() => setIsMenuOpen(false)}
            >
              運営者情報
            </Link>
            <Link
              to="/contact"
              className="block text-white hover:bg-primary-light px-3 py-2 rounded"
              onClick={() => setIsMenuOpen(false)}
            >
              お問い合わせ
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
