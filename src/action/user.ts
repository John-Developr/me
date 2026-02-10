'use client'

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { site, Routes } from "@/config/siteConfig";
import { Detail } from "@/utils/types";

interface LoginResponse {
  success?: boolean;
  error?: string;
}

export const userAction = () => {
    const router = useRouter();

    const [requesting, setRequesting] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [user, setUser] = useState<Detail | null>(null);

    const updateDetail = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        
        setRequesting(true);
        setError(null);

        const body = new FormData(event.currentTarget);

        try {
            const response = await fetch(Routes.User, {
                method: 'PUT',
                body: body
            });

            const data: LoginResponse = await response.json();

            if (data.error) {
                console.log('error')
                setError(data.error);
                return
            }

            // router.replace(site.getBaseUrl("admin/dashboard"));
        } catch (err) {
            console.error('Debug-Log: [Action][login][Failed]: ', err);
        } finally {
            setRequesting(false)
        }
    };

    const updateProfile = async (event: FormEvent<HTMLInputElement>) => {
        const target = event.target as HTMLInputElement;

        const file = target.files?.[0];
        if (!file) return;

        console.log('Selected file:', file);

        const body = new FormData();
        body.append('profile', file);

        try {
            const response = await fetch(Routes.User, {
                method: 'PUT',
                body: body
            });

            const data: LoginResponse = await response.json();

            if (data.error) {
                console.log('error')
                setError(data.error);
                return
            }

            // router.replace(site.getBaseUrl("admin/dashboard"));
        } catch (err) {
            console.error('Debug-Log: [Action][login][Failed]: ', err);
        } finally {
            setRequesting(false)
        }
    }

    const updateBackground = async (event: FormEvent<HTMLInputElement>) => {
        const target = event.target as HTMLInputElement;

        const file = target.files?.[0];
        if (!file) return;

        console.log('Selected file:', file);

        const body = new FormData();
        body.append('profile', file);

        try {
            const response = await fetch(Routes.User, {
                method: 'PUT',
                body: body
            });

            const data: LoginResponse = await response.json();

            if (data.error) {
                console.log('error')
                setError(data.error);
                return
            }

            // router.replace(site.getBaseUrl("admin/dashboard"));
        } catch (err) {
            console.error('Debug-Log: [Action][login][Failed]: ', err);
        } finally {
            setRequesting(false)
        }
    }


    const fetchUser = async () => {
        try {
            const response = await fetch(Routes.User, {
                method: 'GET'
            });

            const { result } = await response.json();
            setUser(result);
        } catch (error) {
            console.error("fetchUser error:", error);
            setUser(null);
        }
    };


    return { 
        requesting, 
        error, 

        updateDetail,

        updateProfile,

        // Fetch user with response
        user,
        fetchUser
    };
};