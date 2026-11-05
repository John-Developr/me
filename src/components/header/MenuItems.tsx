'use client'

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

import Home from "@/components/icons/Home";
import Category from "@/components/icons/Category";
import Star from "@/components/icons/Star";
import Document from "@/components/icons/Document";
import Send from "@/components/icons/Send";
import Brightness from "../icons/Brightness";
import Moon from "../icons/Moon";

import { useApp } from "@/lib/.context/AppContext";

const menuItems = [
    { path: "/",           label: "Home",       Icon: Home      },
    { path: "/projects",   label: "Projects",   Icon: Category  },
    { path: "/tech-stack", label: "Tech Stack", Icon: Star      },
    { path: "/blog",       label: "Blogs",      Icon: Document  },
    { path: "/contact",    label: "Contact",    Icon: Send      },
];

interface MenuItemsProps {
    onClose: () => void;
}

const MenuItems = ({ onClose }: MenuItemsProps) => {
    const pathname = usePathname();
    const router = useRouter();

    const { toggleTheme, isDark } = useApp();

    // Items navigate via router.push, which doesn't prefetch like <Link>.
    useEffect(() => {
        menuItems.forEach(({ path }) => router.prefetch(path));
    }, [router]);

    return (
        <>
            {/* Normal Menu Items */}
            {menuItems.map(({ path, label, Icon }) => (
                <li
                    key={path}
                    className={pathname === path ? "active" : ""}
                    onClick={() => { 
                        router.push(path);
                        onClose();
                    }}>
                    <Icon width={15} height={15} /> {label}
                </li>
            ))}

            {/* Theme Toggle Item */}
            <li
                key="theme-toggle"
                className={isDark ? "dark-mode" : "light-mode"}
                onClick={() => {
                    toggleTheme();
                    onClose();
                }}>
                {isDark ? (
                    <>
                        <Brightness 
                            width={15} 
                            height={15} /> 
                        Light Mode
                    </>
                ) : (
                    <>
                        <Moon 
                            width={15} 
                            height={15} /> 
                        Dark Mode
                    </>
                )}
            </li>
        </>
    );
};

export default MenuItems;