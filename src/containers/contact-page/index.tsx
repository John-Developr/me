'use client'

import { useState } from "react";
import { sileo } from "sileo";
import { useAnimateIn } from "@/hooks/useAnimateIn";

import Header from "@/components/header/Header";   
import Footer from "@/components/footer/Footer";
import PageIntro from "@/components/header/PageIntro";

import styles from "@/styles/pages/contact.module.css";

import Message from "@/components/icons/Message";
import Document from "@/components/icons/Document";
import Send from "@/components/icons/Send";
import HrHorizontal from "@/components/hr/HrHorizontal";

import { networkDefine } from "@/config/networkDefine";
import { InquiryType } from "@/utils/types";

const inquiryOptions = [
  {
    label: InquiryType.JobOpportunity,
    description: "Hiring or job-related discussion",
    icon: "💼",
  },
  {
    label: InquiryType.FreelanceProject,
    description: "Let's work together on a project",
    icon: "🚀",
  },
  {
    label: InquiryType.GeneralInquiry,
    description: "Ask me anything or general questions",
    icon: "💬",
  },
] as const;

const budgetOptions = [
    { label: "Small Task",       range: "Less than $100" },
    { label: "Basic Project",    range: "$100 \u2013 $300" },
    { label: "Standard Project", range: "$300 \u2013 $700" },
    { label: "Advanced Project", range: "$700 \u2013 $1,500" },
    { label: "Large Project",    range: "$1,500+" },
] as const;

export default function ContactPage() {
    const form = useAnimateIn<HTMLDivElement>({ delay: 200, duration: 600 });
    
    const [selectedType, setSelectedType] = useState<InquiryType>(InquiryType.GeneralInquiry);
    const [selectedBudget, setSelectedBudget] = useState<typeof budgetOptions[number]["label"]>(budgetOptions[0].label);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        sileo.clear();

        const form = e.currentTarget;
        const formData = new FormData(form);
        const jsonData: Record<string, string> = {};
        
        formData.forEach((value, key) => {
            jsonData[key] = value as string;
        });

        const handleRequest = async () => {
            const response = await fetch(networkDefine.CONTACT_FORM_API, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(jsonData),
            });

            const data = await response.json();

            if (!data.result) {
                throw new Error(data.message);
            }

            return data;
        };

        sileo.promise(handleRequest(), {
            loading: { title: "Reaching out to John..." },
            success: {
                title: "Message sent!",
                description: "Thank you for contacting me! I will get back to you within 24 hours.",
            },
            error: (err) => ({
                title: (err as Error).message ?? "Failed to submit form",
                description: "Unable to process your request, please try again.",
            }),
        });
    };

    return (
        <>
            <Header />
            <PageIntro 
                subtitle="Let's Work" 
                title="Together" 
                intro={`
                    Have a project in mind, a collaboration opportunity, or just want to say hello? 
                    I'm always open to discussing new ideas and meaningful work. 
                    Fill out the form below and I'll get back to you as soon as possible.`
                } />
                <div className={styles.contactContainer} ref={form.ref} style={form.style}>
                    <HrHorizontal 
                    spacingH={0} 
                    spacingV={0} 
                    thickness={1} />
    
                    <br />
                    <br />
                    <form className={styles.contactForm} onSubmit={handleSubmit}>
                        <p className={styles["custom-title"]}>Personal Details</p>
                        <div className={styles["form-row"]}>
                            <div className={styles["form-group"]}>
                                <label htmlFor="fname">First Name</label>
                                <input 
                                    type="text" 
                                    placeholder="Enter your first name" 
                                    className={styles["form-control"]} 
                                    name="fname" />
                            </div>
                            <div className={styles["form-group"]}>
                                <label htmlFor="lname">Last Name</label>
                                <input 
                                    type="text" 
                                    placeholder="Enter your last name" 
                                    className={styles["form-control"]} 
                                    name="lname" />
                            </div>
                        </div>
                        <div className={`${styles["form-group"]} ${styles["with-icon"]}`}>
                            <label htmlFor="email">Email</label>
                            <span className={styles["input-icon-wrapper"]}>
                                <Message width={20} height={20} />
                            </span>
                            <input 
                                type="email" 
                                placeholder="Enter your e-mail" 
                                className={styles["form-control"]} 
                                name="email" />
                        </div>
                        <div className={`${styles["form-group"]} ${styles["with-icon"]}`}>
                            <label htmlFor="subject">Subject</label>
                            <span className={styles["input-icon-wrapper"]}>
                                <Document width={20} height={20} />
                            </span>
                            <input 
                                type="text" 
                                placeholder="Enter the subject" 
                                className={styles["form-control"]} 
                                name="subject" />
                        </div>
                        <div className={styles["form-group"]}>
                            <p className={styles["custom-title"]}>Select Inquiry</p>
                            <div className={styles["card-container-type"]}>
                                {inquiryOptions.map((option) => (
                                    <div
                                        key={option.label}
                                        className={`
                                            ${styles.card} 
                                            ${selectedType === option.label ? styles.active : ""}
                                        `}
                                        onClick={() => setSelectedType(option.label)}>
                                        <div className={styles.icon}>{option.icon}</div>
                                        <div>
                                            <p className={styles.title}>{option.label}</p>
                                            <p className={styles.description}>{option.description}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <input type="hidden" name="type" value={selectedType} />
                        </div>
                        {selectedType === InquiryType.FreelanceProject && (
                            <div className={styles["form-group"]}>
                                <p className={styles["custom-title"]}>Select Budget</p>
                                <div className={styles["card-container-budget"]}>
                                {budgetOptions.map(option => (
                                    <div
                                        key={option.label}
                                        className={`
                                            ${styles.card} 
                                            ${selectedBudget === option.label ? styles.active : ""}
                                        `}
                                        onClick={() => setSelectedBudget(option.label)}>
                                        <div className={styles.circle}></div>
                                        <div className={styles.content}>
                                            <p className={styles.title}>{option.label}</p>
                                            <p className={styles.description}>{option.range}</p>
                                        </div>
                                    </div>
                                ))}
                                </div>
                                <input type="hidden" name="budget" value={selectedBudget} />
                            </div>
                        )}
                        <div className={styles["form-group"]}>
                            <label htmlFor="message">Message</label>
                            <textarea 
                                className={styles["form-control"]} 
                                name="message" 
                                placeholder="Enter your message" rows={6} />
                        </div>
                        <button type="submit" className={styles.btn}>
                            Start the Conversation 
                            <Send width={20} height={20} />
                        </button>
                    </form>
                </div>
            <Footer />
        </>
    );
}