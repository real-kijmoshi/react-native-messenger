import { ActivityIndicator, Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { supabase } from "../../utils/supabase";
import { useRouter } from "expo-router";
import useProfile from "../../hooks/useProfile";
import { TextInput } from "react-native";
import { useEffect, useState } from "react";
import Avatar from "../../components/Avatar";

export default function Settings() {
    const router = useRouter();
    const [profile, loading] = useProfile();

    const [username, setUsername] = useState("loading...");
    const [isUpdating, setIsUpdating] = useState(false);

    useEffect(() => {
        setUsername(profile?.username || "Guest");
    }, [profile]);

    const updateProfile = async ({ username, avatarUrl }) => {
        setIsUpdating(true);
        try {
            await supabase
                .from('profiles')
                .upsert({
                    id: (await supabase.auth.getUser()).data.user.id,
                    username,
                    avatar_url: avatarUrl,
                });

            Alert.alert('Success', 'Profile updated successfully!');
        } catch (error) {
            Alert.alert('Error', error.message);
        } finally {
            setIsUpdating(false);
        }
    };

    const logout = async () => {
        Alert.alert('Logout', 'Are you sure you want to logout?', [
            {
                text: 'Cancel',
                style: 'cancel',
            },
            {
                text: 'Logout',
                onPress: async () => {
                    try {
                        await supabase.auth.signOut();

                        // Redirect to login
                        router.replace('/login');
                    } catch (error) {
                        Alert.alert('Error', error.message);
                    }
                },
            },
        ]);
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Settings</Text>
            </View>

            {/* Avatar section with skeleton loader */}
            <View style={styles.section}>
                {loading ? (
                    <View style={{ width: "full", alignItems: 'center' }}>
                        <View style={[styles.avatarSkeleton, styles.avatar]} />
                    </View>
                ) : (
                    <Avatar
                        url={profile?.avatar_url}
                        size={150}
                        onUpload={(avatarUrl) => updateProfile({ username, avatarUrl })}
                    />
                )}
            </View>

            {/* Username section with skeleton loader */}
            <View style={styles.section}>
                <Text style={styles.label}>Username</Text>
                {loading ? (
                    <View style={styles.textInputSkeleton} />
                ) : (
                    <TextInput
                        style={styles.textInput}
                        value={username}
                        editable={!loading}
                        onChangeText={setUsername}
                    />
                )}
            </View>

            {/* Save Button */}
            <TouchableOpacity
                style={styles.saveButton}
                onPress={() => updateProfile({ username, avatarUrl: profile?.avatar_url })}
                disabled={isUpdating}
            >
                {isUpdating ? (
                    <ActivityIndicator color="#fff" />
                ) : (
                    <Text style={styles.saveText}>Save</Text>
                )}
            </TouchableOpacity>

            {/* Logout Button */}
            <View style={styles.logoutContainer}>
                <TouchableOpacity style={styles.logoutButton} onPress={logout}>
                    <Text style={styles.logoutText}>Logout</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#f8f9fa',
    },
    header: {
        alignItems: 'center',
        marginBottom: 20,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#333',
    },
    section: {
        marginBottom: 20,
    },
    label: {
        fontSize: 18,
        color: '#555',
        marginBottom: 5,
    },
    textInput: {
        padding: 15,
        fontSize: 16,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 10,
        backgroundColor: '#fff',
    },
    saveButton: {
        backgroundColor: '#4CAF50',
        paddingVertical: 15,
        borderRadius: 10,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 2,
        marginBottom: 20,
    },
    saveText: {
        fontSize: 18,
        color: 'white',
        fontWeight: '600',
    },
    logoutContainer: {
        flex: 1,
        justifyContent: 'flex-end',
        paddingBottom: 20,
    },
    logoutButton: {
        backgroundColor: '#ff4d4f',
        paddingVertical: 15,
        borderRadius: 10,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 2,
    },
    logoutText: {
        fontSize: 18,
        color: 'white',
        fontWeight: '600',
    },

    // Skeleton loader styles
    avatarSkeleton: {
        alignItems: 'center',
        justifyContent: 'center', 
        backgroundColor: '#ddd',
        width: 150,
        height: 150,
        borderRadius: 5,
    },
    textInputSkeleton: {
        height: 50,
        backgroundColor: '#ddd',
        borderRadius: 10,
    },
});
