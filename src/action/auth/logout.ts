'use client'

import { ButtonHTMLAttributes, useState } from "react";
import { useRouter } from "next/navigation";
import { site } from "@/config/siteConfig";
import { PublicRoutes, Routes } from "@/config/siteConfig";

interface LogoutResponse {
  success?: boolean;
  error?: string;
}

const logout = () => {
    const router = useRouter();
    const [requesting, setRequesting] = useState<Boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const request = async () => {
        try {
            const response = await fetch(Routes.Auth, { method: "DELETE" });
            let data: LogoutResponse = await response.json();

            if (data.error) {
                setError(data.error);
                return
            }

            router.replace(site.getBaseUrl(PublicRoutes.Login));
        } catch (err) {
            console.error("Debug-Log: [Action][logout][Failed]: ", err);
        } finally {
            setRequesting(false)
        }
    };

    return {
        requesting,
        request,
    };
};

export {
    logout
}
