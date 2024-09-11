import { supabase } from "../utils/supabase";
import { useState, useEffect } from "react";

export default function useProfile(id) {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchProfile() {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', (id || (await supabase.auth.getUser()).data.user.id))
                .single();

            if (error) {
                console.error(error);
            } else {
                setProfile(data);
            }

            setLoading(false);
        }

        fetchProfile();
    }, [id]);

    return [profile, loading];
}