'use client';

import { useRouter } from 'next/navigation'; // App Router
import React, { ReactNode, HTMLAttributes } from "react";

import LeftNav from "./left-nav/LeftNav";
import RightPanel from "./right-panel/RightPanel";

import ArrowLeft from "../icons/ArrowLeft";

interface AdminProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
  pageTitle?: String;
  enableBack?: Boolean;
}

export default function Admin({ children, pageTitle = "", enableBack = false, ...rest }: AdminProps) {
    const router = useRouter();

    return (
        <main {...rest}>
            <LeftNav />
            <section className="nav-content">
                <div className="mg">
                    <div className="page-title">
                        {enableBack && <button onClick={() => router.back()}>
                            <ArrowLeft v={2} width={18} height={18} />
                        </button>}
                        <h2>{pageTitle}</h2>
                    </div>
                    <br />
                    {children}
                </div>
            </section>
            <RightPanel />
        </main>
    );
}
