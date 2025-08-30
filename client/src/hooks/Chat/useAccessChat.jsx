// src/hooks/Chat/useAccessChat.js
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { chatAPI } from '../../services/api';
import { QUERY_KEYS } from '../queries/chatQueries';
import { toast } from 'react-toastify';

const useAccessChat = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, isGroupChat, chatData = null }) => {
      if (isGroupChat && chatData) {
        // For group chats, return the existing chat data
        return chatData;
      } else if (!isGroupChat) {
        // For individual chats, create or get existing chat
        const response = await chatAPI.createUserChat(userId);
        return response.data.data;
      } else {
        // Fallback for group chat without data
        return {
          _id: userId,
          isGroupChat: true,
          participants: [],
          chatName: 'Group Chat',
          lastMessage: [],
        };
      }
    },
    onSuccess: (data) => {
      // Invalidate chats query to refetch updated list
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CHATS });
    },
    onError: (error) => {
      toast.error('Failed to access chat', {
        position: 'bottom-center',
        theme: 'dark',
      });
      console.error('Access chat error:', error);
    },
  });
};

export default useAccessChat;
