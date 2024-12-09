import { AccessibilityBar } from "../components/accessibility-bar";
import NavBar from "../components/NavBar";

const menuList = [
  { index: 1, text: "Inicio", href: "/teacher/home", children: [] },
  { index: 2, text: "Mis grupos", href: "/teacher/groups", children: [] },
  { index: 3, text: "Actividades", href: "/teacher/lessons", children: [{index: 1, text: "Tareas", href: "/teacher/lessons/assignment"}, {index: 2, text: "Predeterminadas", href: "/teacher/lessons/default"}, {index: 3, text: "Públicas", href: "/teacher/lessons/public"}] },
  { index: 4, text: "Acerca de", href: "/teacher/about", children: [] },
  { index: 5, text: "Preguntas frecuentes", href: "/teacher/faqs", children: [] },
];

export default function TeacherLayout({ children }) {
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
