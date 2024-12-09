import { AccessibilityBar } from "../components/accessibility-bar";
import NavBar from "../components/NavBar";

const menuList = [
  { index: 1, text: "Inicio", href: "/student/home", children: []  },
  { index: 2, text: "Mis grupos", href: "/student/groups", children: []  },
  { index: 3, text: "Actividades", href: "/student/lessons", children: [{index: 1, text: "Tareas", href: "/student/lessons/assignment"}, {index: 2, text: "Predeterminadas", href: "/student/lessons/default"}, {index: 3, text: "Públicas", href: "/student/lessons/public"}]  },
  { index: 4, text: "Acerca de", href: "/student/about", children: []  },
  { index: 5, text: "Preguntas frecuentes", href: "/student/faqs", children: []  },
];

export default function StudentLayout({ children }) {
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
