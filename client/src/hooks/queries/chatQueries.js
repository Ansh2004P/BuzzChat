import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { chatAPI, messageAPI, userAPI } from '../../services/api';
import { toast } from 'react-toastify';

// Query Keys
export const QUERY_KEYS = {
  CHATS: ['chats'],
  CHAT_MESSAGES: (chatId) => ['chat-messages', chatId],
  USERS: ['users'],
  SEARCH_USERS: (query) => ['search-users', query],
};

// Custom hooks for chat operations
export const useChats = () => {
  return useQuery({
    queryKey: QUERY_KEYS.CHATS,
    queryFn: async () => {
      const { data } = await chatAPI.getUserChats();
      return data.data;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    onError: (error) => {
      toast.error('Failed to fetch chats', {
        position: 'bottom-center',
        theme: 'dark',
      });
    },
  });
};

export const useChatMessages = (chatId) => {
  return useQuery({
    queryKey: QUERY_KEYS.CHAT_MESSAGES(chatId),
    queryFn: async () => {
      if (!chatId) return [];
      const { data } = await chatAPI.getChatMessages(chatId);
      return data.data;
    },
    enabled: !!chatId,
    staleTime: 30 * 1000, // 30 seconds for messages
    onError: (error) => {
      toast.error('Failed to fetch messages', {
        position: 'bottom-center',
        theme: 'dark',
      });
    },
  });
};

export const useSearchUsers = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (query) => {
      const response = await userAPI.searchUsers(query);
      return response.data; // Return the full response data structure
    },
    onSuccess: (data, query) => {
      // Cache the search results
      queryClient.setQueryData(
        QUERY_KEYS.SEARCH_USERS(query),
        data.data || data // Handle different response structures
      );
    },
    onError: (error) => {
      const errorMessage = error.response?.data?.message || 'Error searching users';
      console.error('Search error:', errorMessage);
      // Don't show toast for search errors as they're handled in the component
    },
  });
};

export const useSendMessage = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ chatId, formData }) => messageAPI.sendMessage(chatId, formData),
    
    // Optimistic update for instant UI response
    onMutate: async ({ chatId, formData, tempMessage }) => {
      // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.CHAT_MESSAGES(chatId) });

      // Snapshot the previous value
      const previousMessages = queryClient.getQueryData(QUERY_KEYS.CHAT_MESSAGES(chatId));

      // Optimistically update to the new value with temporary message
      if (tempMessage) {
        queryClient.setQueryData(
          QUERY_KEYS.CHAT_MESSAGES(chatId),
          (oldMessages) => [tempMessage, ...(oldMessages || [])]
        );
      }

      // Return a context object with the snapshotted value
      return { previousMessages };
    },

    onSuccess: (data, { chatId }) => {
      // Update with the real message from server
      queryClient.setQueryData(
        QUERY_KEYS.CHAT_MESSAGES(chatId),
        (oldMessages) => {
          // Remove the temporary message and add the real one
          const filtered = oldMessages?.filter(msg => !msg.isTemporary) || [];
          return [data.data.data, ...filtered];
        }
      );
      
      // Invalidate chats to update last message
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CHATS });
    },

    onError: (error, { chatId }, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      queryClient.setQueryData(
        QUERY_KEYS.CHAT_MESSAGES(chatId),
        context.previousMessages
      );
      
      toast.error('Failed to send message', {
        position: 'bottom-center',
        theme: 'dark',
      });
    },

    // Always refetch after error or success to ensure we have the latest data
    onSettled: (data, error, { chatId }) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CHAT_MESSAGES(chatId) });
    },
  });
};

export const useCreateChat = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (userId) => chatAPI.createUserChat(userId),
    onSuccess: () => {
      // Invalidate chats query to refetch
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CHATS });
    },
    onError: (error) => {
      toast.error('Failed to create chat', {
        position: 'bottom-center',
        theme: 'dark',
      });
    },
  });
};

export const useCreateGroupChat = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data) => chatAPI.createGroupChat(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CHATS });
      toast.success('Group chat created successfully!', {
        position: 'bottom-center',
        theme: 'dark',
      });
    },
    onError: (error) => {
      toast.error('Failed to create group chat', {
        position: 'bottom-center',
        theme: 'dark',
      });
    },
  });
};

export const useRemoveParticipant = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ userId, chatId }) => chatAPI.removeParticipant(userId, chatId),
    onSuccess: () => {
      // Invalidate chats to refresh the list
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CHATS });
      
      toast.success('Participant removed successfully', {
        position: 'bottom-center',
        theme: 'dark',
      });
    },
    onError: (error) => {
      const errorMessage = error.response?.data?.message || 'Failed to remove participant';
      toast.error(errorMessage, {
        position: 'bottom-center',
        theme: 'dark',
      });
    },
  });
};

export const useAddParticipant = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ userId, chatId }) => chatAPI.addParticipant(userId, chatId),
    onSuccess: () => {
      // Invalidate chats to refresh the list
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CHATS });
      
      toast.success('Participant added successfully', {
        position: 'bottom-center',
        theme: 'dark',
      });
    },
    onError: (error) => {
      const errorMessage = error.response?.data?.message || 'Failed to add participant';
      toast.error(errorMessage, {
        position: 'bottom-center',
        theme: 'dark',
      });
    },
  });
};

export const useLeaveGroup = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (chatId) => chatAPI.leaveGroup(chatId),
    onSuccess: () => {
      // Invalidate chats to refresh the list
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CHATS });
      
      toast.success('Left group successfully', {
        position: 'bottom-center',
        theme: 'dark',
      });
    },
    onError: (error) => {
      const errorMessage = error.response?.data?.message || 'Failed to leave group';
      toast.error(errorMessage, {
        position: 'bottom-center',
        theme: 'dark',
      });
    },
  });
};

export const useRenameGroup = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ chatId, chatName }) => chatAPI.renameGroup(chatId, chatName),
    onSuccess: () => {
      // Invalidate chats to refresh the list
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CHATS });
      
      toast.success('Group renamed successfully', {
        position: 'bottom-center',
        theme: 'dark',
      });
    },
    onError: (error) => {
      const errorMessage = error.response?.data?.message || 'Failed to rename group';
      toast.error(errorMessage, {
        position: 'bottom-center',
        theme: 'dark',
      });
    },
  });
};

export const useUpdateGroupAvatar = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ chatId, formData }) => {
      const updatedFormData = new FormData();
      // Copy all entries from the original formData
      for (let [key, value] of formData.entries()) {
        updatedFormData.append(key, value);
      }
      // Ensure chatId is in the formData
      updatedFormData.append('chatId', chatId);
      return chatAPI.updateGroupAvatar(chatId, updatedFormData);
    },
    onSuccess: () => {
      // Invalidate chats to refresh the list
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CHATS });
      
      toast.success('Avatar updated successfully', {
        position: 'bottom-center',
        theme: 'dark',
      });
    },
    onError: (error) => {
      const errorMessage = error.response?.data?.message || 'Failed to update avatar';
      toast.error(errorMessage, {
        position: 'bottom-center',
        theme: 'dark',
      });
    },
  });
};
