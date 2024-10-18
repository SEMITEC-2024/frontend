import { AccessibilityBar } from "../components/accessibility-bar";
import NavBar from "../components/NavBar";

const menuList = [
  { text: "Inicio", href: "/student/home", children: []  },
  { text: "Mis grupos", href: "/student/groups", children: []  },
  { text: "Actividades", href: "/student/lessons", children: [{text: "Tareas", href: "/student/lessons"}, {text: "Predeterminadas", href: "/student/lessons"}, {text: "Públicas", href: "/student/lessons"}]  },
  { text: "Acerca de", href: "/student/about", children: []  },
  { text: "Preguntas frecuentes", href: "/student/faqs", children: []  },
];

export default function StudentLayout({
    children,
}) {
    return (
        <>
      <NavBar menuList={menuList} />
      <AccessibilityBar />
            {children}
        </>
    )
}