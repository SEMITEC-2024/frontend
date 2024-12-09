"use client";
import { useEffect, useState, useRef } from "react";
import styles from "./AccessibilityBar.module.css";
import Image from "next/image";
import voiceSpeed from "../ui/speed.svg";
import typography from "../ui/typography.svg";
import smaller from "../ui/smaller.svg";
import bigger from "../ui/bigger.svg";
import contrast from "../ui/contrast.svg";
import { useTheme } from "next-themes";
import Menu from "@/app/components/Menu.js";
import { FormCheck } from "react-bootstrap";

export function AccessibilityBar() {
  const { theme, setTheme } = useTheme();
  const [themesMenuStatus, setThemesMenuStatus] = useState(false);

  const themes = ["Predeterminado", "Amanecer", "Anochecer", "Ceniza", "Grafito", "Noche"];
  const openThemesMenu = (event) => {
    if (event.key === 'Enter'){
      event.preventDefault();
      setThemesMenuStatus((prev) => !prev);
    }
  };

  const handleThemeChange = (index) => {
    setTheme(themes[index]);
    setThemesMenuStatus((prev) => !prev);
    document.getElementById("message").textContent = "Se ha cambiado el tema seleccionado a: "+ themes[index]
    setTimeout(() => {
      document.getElementById("message").textContent = "";
    }, 3000);
  };
  const handleBlur = (event) => {
    if (!event.currentTarget.contains(event.relatedTarget)) {
      setThemesMenuStatus(false);
    }
  };
  return (
    <div className={styles.bar} onBlur={handleBlur}>
      {/* <button aria-label="Disminuir tamaño de letra">
        <svg
          className="accessibility-bar-btn-content"
          xmlns="http://www.w3.org/2000/svg"
          height="100%"
          viewBox="0 0 24 24"
          width="1.2vw"
          fill="#FFFFFF"
        >
          <path d="M0 0h24v24H0V0z" fill="none" />
          <path d="M18 13H6c-.55 0-1-.45-1-1s.45-1 1-1h12c.55 0 1 .45 1 1s-.45 1-1 1z" />
        </svg>
      </button>
      <button aria-label="Aumentar tamaño de letra">
        <svg
          className="accessibility-bar-btn-content"
          xmlns="http://www.w3.org/2000/svg"
          height="100%"
          viewBox="0 0 24 24"
          width="1.2vw"
          fill="#FFFFFF"
        >
          <path d="M0 0h24v24H0V0z" fill="none" />
          <path d="M18 13h-5v5c0 .55-.45 1-1 1s-1-.45-1-1v-5H6c-.55 0-1-.45-1-1s.45-1 1-1h5V6c0-.55.45-1 1-1s1 .45 1 1v5h5c.55 0 1 .45 1 1s-.45 1-1 1z" />
        </svg>
      </button>
      <button aria-label="Seleccionar tipografía">
        <svg
          width="1.2vw"
          height="100%"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            className="accessibility-bar-btn-content"
            d="M10.8766 20V5.912H5.54859V3.968H18.4606V5.912H13.1326V20H10.8766Z"
            fill="white"
          />
        </svg>
      </button> */}
      <button
        aria-label="Selecionar tema de contraste"
        style={{ marginRight: "16px" }}
        className={styles.buttonBar}
        onClick={() => setThemesMenuStatus((prevState) => !prevState)}
        onKeyDown={openThemesMenu}
        aria-expanded = {themesMenuStatus}
      >
        <svg
          className="accessibility-bar-btn-content"
          width="1.2vw"
          height="100%"
          xmlns="http://www.w3.org/2000/svg"
          enableBackground="new 0 0 24 24"
          viewBox="0 0 24 24"
          fill="#FFFFFF"
        >
          <g>
            <rect fill="none" height="24" width="24" />
          </g>
          <g>
            <path d="M12,22c5.52,0,10-4.48,10-10S17.52,2,12,2S2,6.48,2,12S6.48,22,12,22z M13,4.07c3.94,0.49,7,3.85,7,7.93s-3.05,7.44-7,7.93 V4.07z" />
          </g>
        </svg>
      </button>
      {themesMenuStatus &&(
        <Menu
        accessible={true}
        isOpen={themesMenuStatus}
        menuList={themes}
        handleClick={handleThemeChange}
      />
      )}   
      <div id="message" aria-live="polite" aria-atomic="true" className={styles.sronly}> 
      </div>
    </div>
  );
}
