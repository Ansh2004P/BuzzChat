// src/hooks/Chat/useAccessChat.js
import { useMutation } from 'react-query';
import axios from 'axios';
import { VITE_SERVER_URI } from '../../utils/utils';

const accessChat = async ({userId, isGroupChat}) => {
  const config = {
    withCredentials: true,
    headers: {
      "Content-Type": "application/json",
    },
  };

  const res = await axios.post(
    `${VITE_SERVER_URI}/chat/`,
    { userId, isGroupChat },
    config
  );
  // console.log("response", res.data.data);
  return res.data.data;
};

const useAccessChat = () => {
  return useMutation(accessChat);
};

export default useAccessChat;
