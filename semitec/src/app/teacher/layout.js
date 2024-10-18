import { AccessibilityBar } from "../components/accessibility-bar";
import NavBar from "../components/NavBar";

const menuList = [
  { text: "Inicio", href: "/teacher/home", children: [] },
  { text: "Mis grupos", href: "/teacher/groups", children: [] },
  { text: "Actividades", href: "/teacher/lessons", children: [{text: "Tareas", href: "/teacher/lessons"}, {text: "Predeterminadas", href: "/teacher/lessons"}, {text: "Públicas", href: "/teacher/lessons"}] },
  { text: "Acerca de", href: "/teacher/about", children: [] },
  { text: "Preguntas frecuentes", href: "/teacher/faqs", children: [] },
];

export default function TeacherLayout({ children }) {
  return (
    <>
      <NavBar menuList={menuList} />
      <AccessibilityBar />
      {children}
    </>
  );
}
