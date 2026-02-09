'use client'

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { site, Routes } from "@/config/siteConfig";

interface LoginResponse {
  success?: boolean;
  error?: string;
}

export const login = () => {
    const router = useRouter();

    const [requesting, setRequesting] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const request = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        
        setRequesting(true);
        setError(null);

        const formData = new FormData(event.currentTarget);
        const body = JSON.stringify({ 
            email: formData.get("username"), 
            password: formData.get("password") 
        });

        try {
            const response = await fetch(Routes.Auth, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: body
            });

            const data: LoginResponse = await response.json();

            if (data.error) {
                console.log("error")
                setError(data.error);
                return
            }

            router.replace(site.getBaseUrl("admin/dashboard"));
        } catch (err) {
            console.error("Debug-Log: [Action][login][Failed]: ", err);
        } finally {
            setRequesting(false)
        }
    };

    return { requesting, error, request };
};