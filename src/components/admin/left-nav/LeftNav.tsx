'use client';

import React, { ReactNode } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";

import Home from "@/components/icons/Home";
import Calendar from "@/components/icons/Calendar";
import Wallet from "@/components/icons/Wallet";
import Work from "@/components/icons/Work";
import Category from "@/components/icons/Category";
import Document from "@/components/icons/Document";
import Plus from "@/components/icons/Plus";
import Message from "@/components/icons/Message";
import Signout from "@/components/icons/SignOut";

import { PrivateRoutes } from "@/config/siteConfig";

import { logout } from "@/action/auth/logout";


export default function LeftNav() {

    return (
        <section className="navigation">
            <div className="semi-logo">
                <h2>Lorem Ipsum</h2>
            </div>
            <div className="compose">
                <button>
                    <span className="icon">
                        <Plus 
                        width={20}
                        height={20}/>
                    </span>
                    Compose E-mail
                </button>
            </div>
            <nav id="general">
                <p>General</p>
                <ul>
                    <SidebarItem
                        href="/admin/dashboard"
                        icon={<Home width={18} height={18} />}
                        label="Dashboard" />
                    
                    <li >
                        <a href="">
                            <Calendar
                            height={18}
                            width={18}/>
                            Calendar
                        </a>
                    </li>
                    <li>
                        <a href="">
                            <Wallet
                            width={18}
                            height={18}/>
                            Transaction
                        </a>
                    </li>
                </ul>
            </nav>
            <nav id="Portfolio">
                <p>Portfolio</p>
                <ul>
                    <SidebarItem
                        href="/admin/experience"
                        icon={<Work width={18} height={18} />}
                        label="Experience" />
                        
                    <li>
                        <a href="">
                            <Category
                            width={18}
                            height={18}/>
                            Projects
                        </a>
                    </li>
                    <li>
                        <a href="">
                            <Document
                            width={18}
                            height={18}/>
                            Blogs
                        </a>
                    </li>
                </ul>
            </nav>
            <nav id="Other">
                <p>Other</p>
                <ul>
                    <li>
                        <a href="">
                            <Message
                            width={18}
                            height={18}/>
                            Inquiry
                        </a>
                    </li>
                </ul>
            </nav>
            <div className="bottom-area">
                <button onClick={logout().request}>
                    <span className="icon">
                        <Signout
                        width={25}
                        height={25}/>
                    </span>
                    Sign out
                </button>
            </div>
        </section>
    )
}


type SidebarItemProps = {
  href: string;
  icon: ReactNode; // pass in the icon component
  label: string;
};

function SidebarItem({ href, icon, label }: SidebarItemProps) {
    const pathname = usePathname();
    const active = (pathname === href)
 
    return (
        <li className={active ? "active" : ""}>
            <Link href={href}>
                {icon}
                {label}
            </Link>
        </li>
    );
}