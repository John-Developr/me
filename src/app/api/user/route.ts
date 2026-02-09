import { NextResponse } from "next/server";
import { createSupabaseServer } from "@/utils/supabase/server";
import { ProfileService } from "@/lib/services/userService";

export async function PUT(req: Request) {
    try {
        const server = await createSupabaseServer();
        const requestFormData = await req.formData();

        const service = new ProfileService(server, requestFormData);
        await service.index();

        return NextResponse.json(
            { result: true }, 
            { status: 200 }
        );
    } catch (err: any) {
        return NextResponse.json(
            { result: false, message: err.message }, 
            { status: 500 }
        );
    }
}

export async function GET(req: Request) {
    try {
        const server = await createSupabaseServer();
        const service = new ProfileService(server);

        return NextResponse.json(
            { result: await service.getUser() }, 
            { status: 200 }
        );
    } catch (err: any) {
        return NextResponse.json(
            { result: false, message: err.message }, 
            { status: 500 }
        );
    }
}
