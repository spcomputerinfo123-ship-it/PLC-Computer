import React, { createContext, useContext, useState, useEffect } from "react";

export type ColorPreset = {
  id: string;
  nameKm: string;
  nameEn: string;
  hex: string;
};

export const THEME_COLORS: ColorPreset[] = [
  { id: "blue", nameKm: "ខៀវរ៉ូយ៉ាល់ (Royal Blue)", nameEn: "Royal Blue", hex: "#1d4ed8" },
  { id: "emerald", nameKm: "បៃតងត្បូង (Emerald Green)", nameEn: "Emerald Green", hex: "#059669" },
  { id: "violet", nameKm: "ស្វាយវីអូឡែត (Deep Violet)", nameEn: "Deep Violet", hex: "#7c3aed" },
  { id: "crimson", nameKm: "ក្រហមឆ្អិន (Crimson Red)", nameEn: "Crimson Red", hex: "#dc2626" },
  { id: "amber", nameKm: "លឿងទង់ដែង (Amber Gold)", nameEn: "Amber Gold", hex: "#d97706" },
  { id: "cyan", nameKm: "ខៀវស៊ីយ៉ាន (Cyber Cyan)", nameEn: "Cyber Cyan", hex: "#0891b2" }
];

interface ThemeContextType {
  currentColor: ColorPreset;
  setColor: (color: ColorPreset) => void;
  colors: ColorPreset[];
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  currentColor: THEME_COLORS[0],
  setColor: () => {},
  colors: THEME_COLORS,
  isDarkMode: false,
  toggleDarkMode: () => {}
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem("plc_theme_dark_mode");
    if (saved !== null) {
      return saved === "true";
    }
    return false; // Always default to light mode (ពន្លឺ) on initial open / preview
  });

  const [currentColor, setCurrentColorState] = useState<ColorPreset>(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const themeParam = urlParams.get('theme');
    if (themeParam) {
      const found = THEME_COLORS.find(c => c.id === themeParam);
      if (found) return found;
    }
    const saved = localStorage.getItem("plc_theme_color");
    if (saved) {
      const found = THEME_COLORS.find(c => c.id === saved || c.hex === saved);
      if (found) return found;
    }
    return THEME_COLORS[0];
  });

  const toggleDarkMode = () => {
    setIsDarkMode(prev => {
      const next = !prev;
      localStorage.setItem("plc_theme_dark_mode", String(next));
      if (next) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
      return next;
    });
  };

  const setColor = (color: ColorPreset) => {
    setCurrentColorState(color);
    localStorage.setItem("plc_theme_color", color.id);
    document.documentElement.style.setProperty("--color-primary", color.hex);
  };

  useEffect(() => {
    document.documentElement.style.setProperty("--color-primary", currentColor.hex);
  }, [currentColor]);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkMode]);

  return (
    <ThemeContext.Provider value={{ currentColor, setColor, colors: THEME_COLORS, isDarkMode, toggleDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);

