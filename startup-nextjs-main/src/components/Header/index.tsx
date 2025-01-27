"use client";
import Image from "next/image";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import ThemeToggler from "./ThemeToggler";
import menuData from "./menuData";
import { useRouter } from "next/navigation"; // Updated import
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser } from "@fortawesome/free-solid-svg-icons";
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../utils/store';

const Header = () => {
  // Navbar toggle
  const [navbarOpen, setNavbarOpen] = useState(false);
  const [profileImage, setProfileImage] = useState('');
  const [dropdownOpen, ] = useState(false);
  const dispatch = useDispatch();
  const isLoggedIn = useSelector((state: RootState) => state.login.isLoggedIn);
  
  const router = useRouter(); // Correctly initialized router

  
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    console.log(token);
    if(token){
      dispatch({
        type: 'SET_LOGIN_STATUS',
        payload: !isLoggedIn,
      });
    }
    const storedProfileImage = localStorage.getItem('profileImage');
    setProfileImage(storedProfileImage || '');
  }, []);
  
  
  const navbarToggleHandler = () => {
    setNavbarOpen(!navbarOpen);
  };
  
  // Sticky Navbar
  const [sticky, setSticky] = useState(false);
  const handleStickyNavbar = () => {
    if (window.scrollY >= 80) {
      setSticky(true);
    } else {
      setSticky(false);
    }
  };
  
  useEffect(() => {
    window.addEventListener("scroll", handleStickyNavbar);
    return () => {
      window.removeEventListener("scroll", handleStickyNavbar);
    };
  }, []);
  
  // Submenu handler
  const [openIndex, setOpenIndex] = useState(-1);
  const handleSubmenu = (index) => {
    if (openIndex === index) {
      setOpenIndex(-1);
    } else {
      setOpenIndex(index);
    }
  };
  
  const usePathName = usePathname();
  
  

  const handleLogout = async () => {
    
      const response = await fetch('http://localhost:5001/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Add the necessary authentication header (Bearer token)
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
        credentials: 'include', // For including cookies if necessary
      });
  
      // Check if the response is successful
      if (!response.ok) {
        throw new Error('Logout failed');
      }
  
      // Remove data from localStorage
      // Clear the localStorage and state on successful logout
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('profileImage');
      dispatch({
        type: 'SET_LOGIN_STATUS',
        payload: !isLoggedIn,
      });
      
      // Redirect to the sign-in page
      router.push("/signin");
      
    };
    
  return (
    <>
      <header
        className={`header left-0 top-0 z-40 flex w-full items-center ${
          sticky
            ? "dark:bg-gray-dark dark:shadow-sticky-dark fixed z-[9999] bg-white !bg-opacity-80 shadow-sticky backdrop-blur-sm transition"
            : "absolute bg-transparent"
        }`}
      >
        <div className="container">
          <div className="relative -mx-4 flex items-center justify-between">
            <div className="w-60 max-w-full px-4 xl:mr-12">
              <Link
                href="/"
                className={`header-logo block w-full ${
                  sticky ? "py-5 lg:py-2" : "py-8"
                } `}
              >
                <Image
                  src="/images/logo/logo-2.svg"
                  alt="logo"
                  width={140}
                  height={30}
                  className="w-full dark:hidden"
                />
                <Image
                  src="/images/logo/logo.svg"
                  alt="logo"
                  width={140}
                  height={30}
                  className="hidden w-full dark:block"
                />
              </Link>
            </div>
            <div className="flex w-full items-center justify-between px-4">
              <div>
                <button
                  onClick={navbarToggleHandler}
                  id="navbarToggler"
                  aria-label="Mobile Menu"
                  className="absolute right-4 top-1/2 block translate-y-[-50%] rounded-lg px-3 py-[6px] ring-primary focus:ring-2 lg:hidden"
                >
                  <span
                    className={`relative my-1.5 block h-0.5 w-[30px] bg-black transition-all duration-300 dark:bg-white ${
                      navbarOpen ? " top-[7px] rotate-45" : " "
                    }`}
                  />
                  <span
                    className={`relative my-1.5 block h-0.5 w-[30px] bg-black transition-all duration-300 dark:bg-white ${
                      navbarOpen ? "opacity-0 " : " "
                    }`}
                  />
                  <span
                    className={`relative my-1.5 block h-0.5 w-[30px] bg-black transition-all duration-300 dark:bg-white ${
                      navbarOpen ? " top-[-8px] -rotate-45" : " "
                    }`}
                  />
                </button>
                <nav
                  id="navbarCollapse"
                  className={`navbar absolute right-0 z-30 w-[250px] rounded border-[.5px] border-body-color/50 bg-white px-6 py-4 duration-300 dark:border-body-color/20 dark:bg-dark lg:visible lg:static lg:w-auto lg:border-none lg:!bg-transparent lg:p-0 lg:opacity-100 ${
                    navbarOpen
                      ? "visibility top-full opacity-100"
                      : "invisible top-[120%] opacity-0"
                  }`}
                >
                  <ul className="block lg:flex lg:space-x-12">
                    {menuData.map((menuItem) => (
                      
                      <li key={menuItem.id} className="group relative">
                        {menuItem.path ? (
                          <Link
                            href={menuItem.path}
                            className={`flex py-2 text-base lg:mr-0 lg:inline-flex lg:px-0 lg:py-6 ${
                              usePathName === menuItem.path
                                ? "text-primary dark:text-white"
                                : "text-dark hover:text-primary dark:text-white/70 dark:hover:text-white"
                            }`}
                          >
                            {menuItem.title}
                          </Link>
                        ) : (
                          <>
                            <p
                              onClick={() => handleSubmenu(menuItem.id)}
                              className="flex cursor-pointer items-center justify-between py-2 text-base text-dark group-hover:text-primary dark:text-white/70 dark:group-hover:text-white lg:mr-0 lg:inline-flex lg:px-0 lg:py-6"
                            >
                              {menuItem.title}
                              <span className="pl-3">
                                <svg width="25" height="24" viewBox="0 0 25 24">
                                  <path
                                    fillRule="evenodd"
                                    clipRule="evenodd"
                                    d="M6.29289 8.8427C6.68342 8.45217 7.31658 8.45217 7.70711 8.8427L12 13.1356L16.2929 8.8427C16.6834 8.45217 17.3166 8.45217 17.7071 8.8427C18.0976 9.23322 18.0976 9.86639 17.7071 10.2569L12 15.964L6.29289 10.2569C5.90237 9.86639 5.90237 9.23322 6.29289 8.8427Z"
                                    fill="currentColor"
                                  />
                                </svg>
                              </span>
                            </p>
                            <div
                              className={`submenu relative left-0 top-full rounded-sm bg-white transition-[top] duration-300 group-hover:opacity-100 dark:bg-dark lg:invisible lg:absolute lg:top-[110%] lg:block lg:w-[250px] lg:p-4 lg:opacity-0 lg:shadow-lg lg:group-hover:visible lg:group-hover:top-full ${
                                openIndex === menuItem.id ? "block" : "hidden"
                              }`}
                            >
                              {menuItem.submenu.map((submenuItem) => (
                                <Link
                                  href={submenuItem.path}
                                  key={submenuItem.id}
                                  className="block rounded py-2.5 text-sm text-dark hover:text-primary dark:text-white/70 dark:hover:text-white lg:px-3"
                                >
                                  {submenuItem.title}
                                </Link>
                              ))}
                            </div>
                          </>
                        )}
                      </li>
                    ))}
                  </ul>
                </nav>
              </div>
              <div className="flex items-center justify-end pr-16 lg:pr-0 mr-20 h-full ">
                <div>
                  <ThemeToggler />
                </div>
                <div className="flex items-center justify-between">
                  {isLoggedIn  ? (
                      <div className="relative group">
                        {/* Profile Image or Human Icon */}
                        {profileImage ? (
                          <img
                            src={profileImage}
                            alt="Profile"
                            width={40}
                            height={40}
                            className=" rounded-full bg-white transition-opacity duration-300 opacity-100"
                          />
                        ) : (
                          <div className=" h-10 w-10 rounded-full bg-gray-300 flex justify-center items-center">
                            {/* Human Icon (FontAwesome) */}
                            <FontAwesomeIcon
                              icon={faUser}
                              className="text-dark h-6 w-6"
                            />
                          </div>
                        )}
  
                        {/* Dropdown Menu */}
                        <div className="">
  
                        <div className="dark:bg-gray-800
                         absolute left-0 top-full mt-1 w-48 shadow-lg rounded-lg opacity-0 group-hover:opacity-100 group-hover:visible transition-opacity duration-200 invisible"
                         >
                          <Link
                            href="/profile"
                            className="block rounded py-2.5 text-sm text-dark hover:text-primary dark:text-white/50 dark:hover:text-white lg:px-3"
                          >
                            View Profile
                          </Link>
                          <button
                            onClick={() => {
                              handleLogout();
                            }}
                            className="block w-full rounded py-2.5 text-sm text-left text-dark hover:text-primary dark:text-white/70 dark:hover:text-white lg:px-3"
                          >
                            Sign Out
                          </button>
                        </div>
                        </div>
                      </div>
  
                    
                    
                  ) : (
                    <Link
                      href="/signin"
                      className="px-7 py-3 text-base font-medium text-dark hover:opacity-70 dark:text-white md:block"
                    >
                      Sign In
                    </Link>
                  )}
                </div>



                
                
              </div>
            </div>
          </div>
        </div>
      </header>
    </>
  );
};

export default Header;