'use client'

import React from "react";

import styles from "@/styles/pages/techStack.module.css";

import Header from "@/components/header/Header";
import Footer from "@/components/footer/Footer";
import HrHorizontal from "@/components/hr/HrHorizontal";
import PageIntro from "@/components/header/PageIntro";
import SectionTitle from "@/components/header/SectionTitle";
import PageCta from "@/components/cta/PageCta";
import TechChips from "@/components/tech/TechChips";
import Star from "@/components/icons/Star";
import Setting from "@/components/icons/Setting";
import Category from "@/components/icons/Category";
import { ArrowRightV2 } from "@/components/icons/ArrowRight";
import { useAnimateIn } from "@/hooks/useAnimateIn";

import CoreToolCard from "./CoreToolCard";
import CategoryCard from "./CategoryCard";
import { coreStack, toolkit } from "./techStackData";

/** Tools used day to day right now (work + this site). */
const CURRENT_TOOLS = ["Swift", "SwiftUI", "Objective-C", "Next.js", "Supabase", "Google Gemini"];

export default function TechStackPage() {
    const now = useAnimateIn<HTMLElement>({ delay: 80, duration: 600 });

    return (
        <>
            <Header />
            <PageIntro
                subtitle="Technologies & Tools"
                title="stack"
                intro="A curated collection of tools, frameworks, and technologies I use to build modern, scalable, and high-performing applications.
                    From frontend to backend, mobile to web, each piece of this stack reflects my approach to writing clean, efficient, and maintainable code."
            />
            <main className={styles.main}>
                <HrHorizontal
                    spacingH={0}
                    spacingV={0}
                    thickness={1} />

                {/* What I'm working with right now */}
                <section
                    ref={now.ref}
                    style={now.style}
                    className={styles.now}
                    aria-labelledby="right-now-title">
                    <p id="right-now-title" className={styles.eyebrow}>Right Now</p>
                    <p className={styles["now-text"]}>
                        Day to day I build iOS apps at Forty Degrees Celsius with Swift, SwiftUI,
                        and Objective-C — and web projects like this site with Next.js, Supabase,
                        and Google Gemini.
                    </p>
                    <TechChips items={CURRENT_TOOLS} ariaLabel="Tools I use right now" />
                </section>

                <section aria-labelledby="core-stack-title">
                    <SectionTitle
                        id="core-stack-title"
                        title="Core Stack."
                        icon={Star} />
                    <ul className={styles["core-grid"]}>
                        {coreStack.map((tool, index) => (
                            <CoreToolCard
                                key={tool.name}
                                tool={tool}
                                index={index} />
                        ))}
                    </ul>
                </section>

                <section aria-labelledby="toolkit-title">
                    <SectionTitle
                        id="toolkit-title"
                        title="Full Toolkit."
                        icon={Setting} />
                    <div className={styles["toolkit-grid"]}>
                        {toolkit.map((category, index) => (
                            <CategoryCard
                                key={category.slug}
                                category={category}
                                index={index} />
                        ))}
                    </div>
                    <p className={styles["more-note"]}>
                        …and plenty more picked up along the way. Always learning.
                    </p>
                </section>

                <PageCta
                    id="tech-stack-cta-title"
                    title="See the stack in action"
                    text="Browse projects built with these tools — or let's talk about yours."
                    actions={[
                        {
                            label:   "View Projects",
                            href:    "/projects",
                            variant: "primary",
                            icon:    <Category width={16} height={16} />,
                        },
                        {
                            label:   "Let's Work Together",
                            href:    "/contact",
                            variant: "secondary",
                            icon:    <ArrowRightV2 width={16} height={16} />,
                            iconEnd: true,
                        },
                    ]} />
            </main>
            <Footer />
        </>
    );
}
