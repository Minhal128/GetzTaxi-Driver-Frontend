import { DarkTheme, DefaultTheme } from '@react-navigation/native';
import React, { createContext, useContext, useState } from 'react';
import { useColorScheme } from 'react-native';

const ThemeContext = createContext();

export const ThemeProviderContext = ({ children }) => {
  const systemColorScheme = useColorScheme(); // Get system color scheme
  const [isDarkTheme, setIsDarkTheme] = useState(true);
  const toggleTheme = () => setIsDarkTheme((prevTheme) => !prevTheme);

  // Set theme based on isDarkTheme value
  const theme = isDarkTheme ? DarkTheme : DefaultTheme;

  return (
    <ThemeContext.Provider value={{ theme, isDarkTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

// Custom hook to access theme context
export const useTheme = () => useContext(ThemeContext);
