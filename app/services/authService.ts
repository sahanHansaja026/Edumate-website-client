export interface User {
    id: number;
    email: string;
  }
  
  /* -------- SAVE USER AFTER LOGIN -------- */
  export const saveUser = (user: User) => {
    localStorage.setItem("user", JSON.stringify(user));
  };
  
  /* -------- GET USER (ANY PAGE) -------- */
  export const getUser = () => {
    if (typeof window === "undefined") return null;
  
    const user = localStorage.getItem("user");
  
    if (!user || user === "undefined") return null;
  
    try {
      return JSON.parse(user);
    } catch (error) {
      console.error("Invalid user data in localStorage");
      return null;
    }
  };
  
  
  /* -------- CLEAR USER (LOGOUT) -------- */
  export const clearUser = () => {
    localStorage.removeItem("user");
  };
  