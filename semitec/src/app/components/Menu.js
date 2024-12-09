"use client";
import { useEffect, useRef } from "react";
import styles from "./../_styles/Menu.module.css";

export default function Menu({ isOpen, menuList, handleClick }) {
  const firstItemRef = useRef(null);

  useEffect(() => {
    if (isOpen && firstItemRef.current) {
      firstItemRef.current.focus();
    }
  }, [isOpen]);
  return (
    <menu
      style={{
        position: "absolute",
        top: "125px",
        right: "10px",
        border: "1px solid var(--foreground)",
        zIndex: 1000,
        padding: '1vw',
        backgroundColor: 'var(--background)',
        borderRadius: '10px',
        boxShadow: '0px 8px 16px 0px rgba(0,0,0,0.2)',
        flexDirection: 'column'
      }}
    >  
        <ul className={styles.menuList}>
          {menuList.map((item, index) => (
            <li
              tabIndex={0}
              onClick={() => {
                handleClick(index);
              }}
              key={index}
              ref={index === 0 ? firstItemRef : null}
            >
              <div style={{ padding: "5px" }}>{item}</div>
            </li>
          ))}
        </ul>

    </menu>
  );
}
