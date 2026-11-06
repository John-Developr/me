import Category from "@/components/icons/Category";
import Setting from "@/components/icons/Setting";
import Call from "@/components/icons/Call";
import Document from "@/components/icons/Document";
import Synchronize from "@/components/icons/Synchronize";
import Chat from "@/components/icons/Chat";
import EditSquare from "@/components/icons/EditSquare";
import Link from "@/components/icons/Link";
import SquarePassword from "@/components/icons/SquarePassword";
import Work from "@/components/icons/Work";

import { TechCategory, TechTool } from "@/utils/types";

/* ============================================================
   TECH STACK DATA (static)
   ------------------------------------------------------------
   Sources: the home page "Tech Stack." card, the Tech Stack list
   in src/docs/system-instruction.md, and tools used in documented
   work (NativeCamp, Proweaver, this site, COVID Tracker).
   Chip logos come from TECH_LOGOS (src/config/techLogos.ts).
   ============================================================ */

/** "Core Stack." — the tools featured on the home page. */
export const coreStack: TechTool[] = [
    { name: "React / React Native", description: "Scalable web and native applications.",         logo: "/images/tech/react.png" },
    { name: "Next.js",              description: "React framework for fast, SEO-friendly web.",   logo: "/images/tech/next.png" },
    { name: "Node.js",              description: "APIs, servers, and real-time apps.",            logo: "/images/tech/node.png" },
    { name: "Supabase",             description: "Postgres backend with database and auth.",      logo: "/images/tech/supabase.png" },
    { name: "Firebase",             description: "Google's app platform for data and auth.",      logo: "/images/tech/firebase.png" },
    { name: "Xcode",                description: "Apple's IDE for building iOS apps.",            logo: "/images/tech/xcode.png" },
    { name: "Figma",                description: "Collaborative design tool for UI/UX.",          logo: "/images/tech/figma.png" },
    { name: "OpenAI",               description: "AI models for assistants and coding.",          logo: "/images/tech/chatgpt.png" },
];

/** "Full Toolkit." — grouped by area, in display order. */
export const toolkit: TechCategory[] = [
    {
        slug:        "frontend",
        title:       "Frontend",
        description: "Interfaces for the web, from components to full apps.",
        icon:        Category,
        items:       ["JavaScript", "TypeScript", "React", "Next.js", "Vue.js", "AngularJS", "Tailwind CSS", "SCSS", "HTML", "jQuery"],
    },
    {
        slug:        "backend",
        title:       "Backend",
        description: "APIs, servers, and business logic.",
        icon:        Setting,
        items:       ["Node.js", "Express.js", "NestJS", "PHP", "Laravel", "CakePHP", "CodeIgniter", "Python", "Java"],
    },
    {
        slug:        "mobile",
        title:       "Mobile",
        description: "Native and cross-platform apps.",
        icon:        Call,
        items:       ["Swift", "SwiftUI", "Objective-C", "React Native", "Flutter", "Kotlin", "Java (Android)"],
    },
    {
        slug:        "databases",
        title:       "Databases",
        description: "Relational, document, and key-value stores.",
        icon:        Document,
        items:       ["PostgreSQL", "MySQL", "MongoDB", "DynamoDB", "Redis", "Supabase", "Firebase"],
    },
    {
        slug:        "cloud-devops",
        title:       "Cloud & DevOps",
        description: "Infrastructure, containers, and delivery.",
        icon:        Synchronize,
        items:       ["AWS", "Docker", "Kubernetes", "GitHub Actions", "Terraform", "Vercel"],
    },
    {
        slug:        "ai-ml",
        title:       "AI & Machine Learning",
        description: "Models, frameworks, and LLM tooling.",
        icon:        Chat,
        items:       ["Google Gemini", "OpenAI", "LangChain", "Transformers", "TensorFlow", "PyTorch"],
    },
    {
        slug:        "cms",
        title:       "CMS & E-commerce",
        description: "Content platforms and online stores.",
        icon:        EditSquare,
        items:       ["WordPress", "Shopify", "PrestaShop", "Contentful", "Wix"],
    },
    {
        slug:        "integrations",
        title:       "APIs & Integrations",
        description: "Payments, real-time features, and third-party services.",
        icon:        Link,
        items:       ["REST APIs", "Socket.io", "PayPal", "Authorize.net", "Square", "Google Maps"],
    },
    {
        slug:        "security",
        title:       "Security",
        description: "Authentication, access control, and encryption.",
        icon:        SquarePassword,
        items:       ["OAuth", "JWT", "AWS IAM", "AES", "RSA"],
    },
    {
        slug:        "tools",
        title:       "Developer Tools",
        description: "Everyday tools for building and shipping.",
        icon:        Work,
        items:       ["Git", "GitHub", "VS Code", "Xcode", "Android Studio", "Docker Compose", "Postman", "Jira", "Figma"],
    },
];
