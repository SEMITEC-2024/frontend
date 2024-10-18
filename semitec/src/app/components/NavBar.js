"use client";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import Logo from "../ui/logo.svg";
import avatar from "@/app/ui/avatar.svg";
import NavItem from "./NavItem";
import styles from "./NavBar.module.css";
import { useState } from "react";
import DropdownButton from "./dropbutton";

export default function NavBar({ menuList }) {
  const [activeId, setActiveId] = useState(0);
  const pathname = usePathname();
  const router = useRouter();

  const handleProfileClick = () => {
    if (pathname.includes("/teacher")) {
      router.push("/teacher/profile");
    } else {
      router.push("/student/profile");
    }
  };

  return (
    <header>
      <nav className={styles.navBar}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            width: "100%",
          }}
        >
          <div style={{ display: "flex", alignItems: "center" }}>
            {" "}
            <Link href={"/login"}>
              <Image
                src={Logo}
                width={75}
                height={38}
                alt="Logo de SEMITEC. Figura de teclado braile con la palabra SEMITEC debajo"
              />
            </Link>
            <div className={styles.navMenu}>
              {menuList.map((item, index) => (
                <div
                  key={index}
                  onClick={() => {
                    setActiveId(index);
                  }}
                  onFocus={() => {
                    setActiveId(index);
                  }}
                >
                  {item.children && item.children.length > 0 ? (
                      <DropdownButton
                        text={item.text}
                        items={item.children}
                      />
                    ) : (
                      <NavItem
                        active={activeId === index}
                        text={item.text}
                        href={item.href}
                      />
                    )}
                </div>
              ))}
            </div>
          </div>
          <div>
            {" "}
            {pathname.includes("teacher") || pathname.includes("student") ? (
              <button
                aria-label="Ver perfil de usuario"
                style={{ borderRadius: "100px", padding: "0", border: "0" }}
                onClick={handleProfileClick}
              >
                <Image src={avatar} alt="" />
              </button>
            ) : (
              <></>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
}
