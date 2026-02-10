import { SupabaseClient } from "@supabase/supabase-js";
import { Tables, Storage } from "@/config/tables";
import { formDataToJson, generateRandomDigits } from "@/utils/general/helpers";
import { Detail } from "@/utils/types";

export class ProfileService {
    private server: SupabaseClient;
    private data?: FormData;

    private maxFolderAttempts = 5;

    constructor(server: SupabaseClient, data?: FormData) {
        this.server = server;
        this.data = data;
    }

    // Main method to handle User Table
    async index() {
        if (!this.data) {
            throw new Error('Invalid Request');
        }

        const jsonData = formDataToJson(this.data)
        const { data: { user }, error } = await this.server.auth.getUser();

        if (!user) 
            throw new Error('Unauthorized')

        const path = await this.updateProfile(user.id, this.data);

        if (path) {
            jsonData.profile = path
        }

        await this.upsertUserDetail(user.id, jsonData)
    }

    private async updateProfile(userId: string, formData: FormData): Promise<string | null> {
        const file = formData.get('profile') as File | null;
        
        if (!file) 
            return null;

        const {data, error} = await this.server.from(Tables.DETAIL)
            .select('profile')
            .eq('uiid', userId)

        if (error)
            throw new Error(error.message)

        // With Path
        if ((data && data.length > 0) && data[0].profile) {
            await this.replaceProfile(file, data[0].profile)
            return null
        }
       
        // No-Path
        const folderName = await this.generateUniqueFolder();
        const path = await this.uploadProfile(file, folderName);

        return path;
    }

    // Generate unique folder
    private async generateUniqueFolder(): Promise<string> {
        let folderName: string; 
        let exists: boolean = true; 
        let attempts: number = 0;

        do {
            folderName = generateRandomDigits();

            const { data, error } = await this.server
                .from(Tables.DETAIL)
                .select('id')
                .like('profile', `%${folderName}%`)
                .limit(1);

            if (error) 
                throw new Error(`[folder] ${error.message}`);

            exists = (data) && data.length > 0;
            attempts++;

        } while (
            exists && 
            attempts < this.maxFolderAttempts
        );

        return folderName;
    }

    // Upload file to Supabase Storage
    private async uploadProfile(file: File, folderName: string): Promise<string | null> {
        const path: string = `${folderName}/profile.jpg`;
        const { data, error } = await this.server.storage
            .from(Storage.PROFILE)
            .upload(
                path, 
                file, {
                    cacheControl: '3600',
                    upsert: true,
                }
            );

        if (error) 
            throw new Error(error.message);

        return data?.path;
    }

     // Upload file to Supabase Storage
    private async replaceProfile(file: File, path: string) {
        const { data, error } = await this.server.storage
            .from(Storage.PROFILE)
            .update(
                path, 
                file, {
                    cacheControl: '3600',
                    upsert: true
                }
            )

        if (error) 
            throw new Error(error.message);
    }

    // Upsert the user detail row
    private async upsertUserDetail(userId: string, data: Record<string, string>) {
        const { error } = await this.server
            .from(Tables.DETAIL)
            .upsert(
                { ...data, uiid: userId }, 
                { onConflict: 'uiid' }
            );

        if (error) 
            throw new Error(error.message);
    }


    async getUser(): Promise<Detail | null> {
        const { data: { user }, error } = await this.server.auth.getUser();
        const { data: detail, error: errorDetail } = await this.server
            .from(Tables.DETAIL)
            .select('*')
            .limit(1);

        if (errorDetail)
            throw new Error(errorDetail.message);

        const userData = detail?.[0];
        let publicUser: Omit<Detail, 'id' | 'uiid'>;

        if (!userData) 
            return null;

        if (user) {
            // Authenticated users see full data
            publicUser = userData;
        } else {
            // Remove id and uiid for non-authenticated users
            const { id, uiid, ...rest } = userData;
            publicUser = rest;
        }

        if (publicUser.profile) {
            const profileUrl = this.server.storage
                .from(Storage.PROFILE)
                .getPublicUrl(publicUser.profile)
                
            publicUser.profile = profileUrl.data.publicUrl
        }

        return publicUser;
    }
}
