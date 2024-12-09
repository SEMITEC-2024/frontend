import { AccessibilityBar } from "../components/accessibility-bar";
import NavBar from "../components/NavBar";

const menuList = [
  { index: 1, text: "Actividades", href: "/guest/lessons", children: [{index: 1, text: "Predeterminadas", href: "/guest/lessons/default"}, {index: 2, text: "Públicas", href: "/guest/lessons/public"}]  },
  { index: 2, text: "Acerca de", href: "/guest/about", children: [] },
  { index: 3, text: "Preguntas frecuentes", href: "/guest/faqs", children: [] },
];

export default function GuestLayout({ children }) {
  return (
    <>
      <header>
        <NavBar menuList={menuList} />
        <AccessibilityBar />
      </header>
      {children}
    </>
  );
}
