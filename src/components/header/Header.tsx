'use client';

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { Linkedin } from "../icons/Linkedin";
import MenuKebabHorizontalCircle from "../icons/MenuKebabHorizontalCircle";
import Call from "../icons/Call";

import { networkDefine } from "@/config/networkDefine";
import MenuItems from "./MenuItems";

export default function Header() {
  const router = useRouter();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLLIElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const showMenu = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsMenuOpen((prev) => !prev);
  };

  return (
    <section className="header"> 
      <div className="logo">
        <Image
          src="/Logo.png"
          width={75}
          height={17}
          alt="Avatar"
          onClick={() => router.push("/")}
        />
      </div>
      <nav className="nav">
        <ul className="nav-list">
          <li className="phone-no">
            <Call 
            width={17.5} 
            height={17.5} />
            PH, (+632) 9293-1982
          </li>
          <li className="linkend"
            onClick={() => window.open(networkDefine.LINKEDIN_URL, "_blank")}>
            <Linkedin 
              width={17.5} 
              height={17.5} />
          </li>
          <li className="menu" ref={menuRef} onClick={showMenu}>
            <MenuKebabHorizontalCircle 
              width={20.5} 
              height={20.5} />
              {isMenuOpen && (
                <div className="menu-dropdown">
                  <nav>
                    <ul>
                      <MenuItems onClose={() => setIsMenuOpen(false)} />
                    </ul>
                  </nav>
                </div>
              )}
          </li>
        </ul>
      </nav>
    </section>
  );
}

