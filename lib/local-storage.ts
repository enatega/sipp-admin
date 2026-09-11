
export const setItem = <T>(name: string, value: T): void => {
  if (typeof window === "undefined") return; 
  try {
    window.localStorage.setItem(name, JSON.stringify(value));
  } catch (error) {
    console.error("Error setting item in localStorage:", error);
  }
};

export const getItem = <T>(name: string): T | null => {
  if (typeof window === "undefined") return null; 
  try {
    const item = window.localStorage.getItem(name);
    return item ? (JSON.parse(item) as T) : null;
  } catch (error) {
    console.error("Error getting item from localStorage:", error);
    return null;
  }
};

export const removeItem = (name: string): void => {
  if (typeof window === "undefined") return; 
  try {
    window.localStorage.removeItem(name);
  } catch (error) {
    console.error("Error removing item from localStorage:", error);
  }
};
