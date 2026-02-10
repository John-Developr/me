// app/api/logout/route.ts
import { NextResponse } from "next/server";
import { createSupabaseServer } from "@/utils/supabase/server";

interface RequestBody {
  email: string;
  password: string;
}

export async function POST(req: Request) {
   try {
        const body: RequestBody = await req.json();
        const { email, password } = body;

        if (!email && !password) {
            return NextResponse.json(
                { error: 'Email and password are required' },
                { status: 400 }
            )
        }

        if (!email) {
            return NextResponse.json(
                { error: 'E-mail is required' },
                { status: 400 }
            )
        }

        if (!password) {
            return NextResponse.json(
                { error: 'Password is required' },
                { status: 400 }
            )
        }
        
        const server = await createSupabaseServer(); 
        const { error } = await server.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            return NextResponse.json(
                { error: error.message },
                { status: 401 }
            )
        }

        return NextResponse.json({ success: true })
    } catch {
        return NextResponse.json(
            { error: 'Unable to perform login request.' },
            { status: 500 }
        )
    }
}

export async function DELETE() {
    try {
        const server = await createSupabaseServer();
        const { error } = await server.auth.signOut();
        
        if (error) {
            return NextResponse.json(
                { error: error.message || 'Logout failed.' },
                { status: 400 }
            );
        }

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error("Logout failed:", err);
        return NextResponse.json(
            { error: 'Unable to perform logout request.' },
            { status: 500 }
        );
    }
}
