'use client';

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { Linkedin } from "../icons/Linkedin";
import Call from "../icons/Call";
import ThreeDotsHorizontal from "../icons/ThreeDotsHorizontal";

import { useSiteProfile } from "@/lib/.context/SiteProfileContext";
import MenuItems from "./MenuItems";

export default function Header() {
  const router  = useRouter();
  const profile = useSiteProfile();

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
          src="/images/Logo.png"
          width={75}
          height={17}
          alt="Avatar"
          onClick={() => router.push("/")}
        />
      </div>
      <nav className="nav">
        <ul className="nav-list">
          {profile.phone && (
            <li className="phone-no">
              <Call 
              width={17.5} 
              height={17.5} />
              PH, {profile.phone}
            </li>
          )}
          {profile.socials.linkedin && (
            <li className="linkend liquid_glass"
              onClick={() => window.open(profile.socials.linkedin!, "_blank", "noopener,noreferrer")}>
              <Linkedin 
                width={17.5} 
                height={17.5} />
            </li>
          )}
          <li className="menu" ref={menuRef}>
            <button
              type="button"
              className={`menu-trigger liquid_glass${isMenuOpen ? " is-active" : ""}`}
              aria-label="Open menu"
              aria-expanded={isMenuOpen}
              onClick={showMenu}>
              <ThreeDotsHorizontal
                width={20.5}
                height={20.5} />
            </button>
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

