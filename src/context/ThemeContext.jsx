import React, { createContext, useState, useEffect } from "react";

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");

  useEffect(() => {
    localStorage.setItem("theme", theme);

    const body = document.body;
    // Buscamos el navbar por su clase
    const navbar = document.querySelector(".main-header");

    // ¡NUEVA LÓGICA MÁS PRECISA!
    if (theme === "dark") {
      // 1. Añadimos la clase 'dark-mode' al body para el contenido principal
      body.classList.add("dark-mode");

      // 2. Cambiamos las clases del navbar para que sea oscuro
      if (navbar) {
        navbar.classList.remove("navbar-white", "navbar-light");
        navbar.classList.add("navbar-dark");
      }

      // 3. ¡YA NO TOCAMOS LAS CLASES DEL SIDEBAR!
    } else {
      // 1. Quitamos la clase 'dark-mode' del body
      body.classList.remove("dark-mode");

      // 2. Devolvemos al navbar sus clases de modo claro
      if (navbar) {
        navbar.classList.remove("navbar-dark");
        navbar.classList.add("navbar-white", "navbar-light");
      }
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
  };

  const value = {
    theme,
    toggleTheme,
  };

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};
