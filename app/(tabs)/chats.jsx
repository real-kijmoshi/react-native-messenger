import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, TextInput, StyleSheet, Alert } from 'react-native';
import { supabase } from '../../utils/supabase';

export default function Home() {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newChatUsername, setNewChatUsername] = useState('');
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    getCurrentUser();
  }, []);

  useEffect(() => {
    if (currentUser) {
      fetchChats();
    }
  }, [currentUser]);

  const getCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setCurrentUser(user);
  };

  const fetchChats = async () => {
    if (!currentUser) return;

    setLoading(true);
    const { data, error } = await supabase
      .from('chats')
      .select(`
        *,
        messages:messages!messages_chat_id_fkey (
          id,
          content
        )
      `)
      .contains('users', [currentUser.id])
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Error fetching chats:', error);
      Alert.alert('Error', 'Failed to fetch chats');
    } else {
      setChats(data);
    }
    setLoading(false);
  };

  const createChat = async () => {
    if (!newChatUsername.trim() || !currentUser) return;

    // Check if the user exists
    const { data: userData, error: userError } = await supabase
      .from('profiles')
      .select('id')
      .eq('username', newChatUsername)
      .single();

    if (userError || !userData) {
      Alert.alert('Error', 'User not found');
      return;
    }

    // Check if a chat already exists with these users
    const { data: existingChat, error: chatError } = await supabase
      .from('chats')
      .select('id')
      .contains('users', [currentUser.id, userData.id])
      .single();

    if (chatError && chatError.code !== 'PGRST116') {
      console.error('Error checking existing chat:', chatError);
      Alert.alert('Error', 'Failed to create chat');
      return;
    }

    if (existingChat) {
      Alert.alert('Chat Exists', 'You already have a chat with this user.');
      setNewChatUsername('');
      return;
    }

    // Create new chat if it doesn't exist
    const { data: newChat, error: newChatError } = await supabase
      .from('chats')
      .insert({
        title: `Chat with ${newChatUsername}`,
        users: [currentUser.id, userData.id],
      })
      .select()
      .single();

    if (newChatError) {
      console.error('Error creating chat:', newChatError);
      Alert.alert('Error', 'Failed to create chat');
    } else {
      setChats([newChat, ...chats]);
      setNewChatUsername('');
      Alert.alert('Success', 'New chat created!');
    }
  };

  const renderChatItem = ({ item }) => (
    <TouchableOpacity
      style={styles.chatItem}
      onPress={() => {/* Navigate to chat detail */}}
    >
      <Text style={styles.chatTitle}>{item.title}</Text>
      <Text style={styles.lastMessage}>
        {item.messages && item.messages[0] ? item.messages[0].content : 'No messages yet'}
      </Text>
    </TouchableOpacity>
  );

  if (!currentUser) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading user...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.newChatContainer}>
        <TextInput
          style={styles.input}
          value={newChatUsername}
          onChangeText={setNewChatUsername}
          placeholder="Enter username to chat with"
        />
        <TouchableOpacity style={styles.button} onPress={createChat}>
          <Text style={styles.buttonText}>Create Chat</Text>
        </TouchableOpacity>
      </View>
      {loading ? (
        <Text style={styles.loadingText}>Loading chats...</Text>
      ) : (
        <FlatList
          data={chats}
          renderItem={renderChatItem}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={<Text style={styles.emptyText}>No chats yet</Text>}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: 20,
      backgroundColor: '#f5f5f5',
    },
    newChatContainer: {
      flexDirection: 'row',
      marginBottom: 20,
    },
    input: {
      flex: 1,
      borderWidth: 1,
      borderColor: '#ddd',
      padding: 10,
      borderRadius: 5,
      marginRight: 10,
    },
    button: {
      backgroundColor: '#007AFF',
      padding: 10,
      borderRadius: 5,
      justifyContent: 'center',
    },
    buttonText: {
      color: 'white',
      fontWeight: 'bold',
    },
    chatItem: {
      backgroundColor: 'white',
      padding: 15,
      borderRadius: 5,
      marginBottom: 10,
      shadowColor: "#000",
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.23,
      shadowRadius: 2.62,
      elevation: 4,
    },
    chatTitle: {
      fontSize: 16,
      fontWeight: 'bold',
    },
    lastMessage: {
      color: '#666',
      marginTop: 5,
      fontSize: 14,
    },
    loadingText: {
      textAlign: 'center',
      marginTop: 20,
      fontSize: 16,
      color: '#666',
    },
    emptyText: {
      textAlign: 'center',
      marginTop: 20,
      fontSize: 16,
      color: '#666',
    },
  });