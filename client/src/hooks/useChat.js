import { useContext } from "react";
import { ChatContext } from "../store/ChatContext.jsx";

export const useChat = () => useContext(ChatContext);
