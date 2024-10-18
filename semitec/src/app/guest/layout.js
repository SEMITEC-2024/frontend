import { AccessibilityBar } from "../components/accessibility-bar";
import NavBar from "../components/NavBar";

const menuList = [
  { text: "Actividades", href: "/guest/lessons", children: [{text: "Predeterminadas", href: "/guest/lessons"}, {text: "Públicas", href: "/guest/lessons"}]  },
  { text: "Acerca de", href: "/guest/about", children: [] },
  { text: "Preguntas frecuentes", href: "/guest/faqs", children: [] },
];

export default function GuestLayout({ children }) {
  return (
    <>
      <NavBar menuList={menuList} />
      <AccessibilityBar />
      {children}
    </>
  );
}
