'use client'

import React, { useState, useMemo } from "react";

import styles from "@/styles/pages/techStack.module.css";
import Header from "@/components/header/Header";
import Footer from "@/components/footer/Footer";
import HrHorizontal from "@/components/hr/HrHorizontal";
import PageIntro from "@/components/header/PageIntro";

export default function TechStackPage() {

    return (
        <>
            <Header />  
            <PageIntro 
                subtitle="My Tech Stack" 
                title="Tools & Technologies I Use" 
                intro="A curated collection of tools, frameworks, and technologies I use to build modern, scalable, and high-performing applications. 
                    From frontend to backend, mobile to web, each piece of this stack reflects my approach to writing clean, efficient, and maintainable code."
            />
            <main>
                <HrHorizontal 
                    spacingH={0} 
                    spacingV={0} 
                    thickness={1} />

                <br />
                
            </main>
            <Footer />
        </>
    );
}