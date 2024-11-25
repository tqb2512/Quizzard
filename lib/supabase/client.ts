import { createBrowserClient } from "@supabase/ssr";
import Cookies from "js-cookie";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = (accessToken?: string) => {
    const cookie = Cookies.get("sb-supabase-auth-token")?.split("base64-")[1];
    let decodedToken: { access_token: string } = { access_token: "" };
    if (cookie) {
        decodedToken = JSON.parse(atob(cookie));
    }
    const token = accessToken || supabaseKey;
    return createBrowserClient(supabaseUrl, token);
};