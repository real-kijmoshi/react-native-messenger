import { Text, View } from "react-native"
import { supabase } from "../utils/supabase";
import { useEffect } from "react";
import { useRouter } from "expo-router";


export default function App() {
    const router = useRouter();

    useEffect(() => {
        const veriftyUser = async () => {
            const { data: user, error } = await supabase.auth.getUser();
            console.log(user, error);
            if (error) {
                router.replace('/login');
            } else {
                router.replace('/chats');
            }
        };

        veriftyUser();
    }, []);

    return (
        <View>
            <Text>
                Loading...
            </Text>
        </View>
    );
}