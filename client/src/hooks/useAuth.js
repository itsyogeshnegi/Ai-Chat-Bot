import { useContext } from "react";
import { AuthContext } from "../store/AuthContext.jsx";

export const useAuth = () => useContext(AuthContext);
