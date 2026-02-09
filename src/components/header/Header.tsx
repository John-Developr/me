'use client';

import Image from "next/image";

import Linkedin from "../icons/Linkedin";
import MenuKebabHorizontalCircle from "../icons/MenuKebabHorizontalCircle";
import Call from "../icons/Call";

import { networkDefine } from "@/config/networkDefine";

export default function Header() {
  return (
    <section className="header"> 
      <div className="logo">
        <Image
          src="/Logo.png"
          width={75}
          height={17}
          alt="Avatar"
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
          <li className="menu">
            <MenuKebabHorizontalCircle 
            width={20.5} 
            height={20.5} />
          </li>
        </ul>
      </nav>
    </section>
  );
}