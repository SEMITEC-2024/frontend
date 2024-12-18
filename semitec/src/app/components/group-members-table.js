"use client";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import styles from "@/app/_styles/GroupsTable.module.css";
import buttonStyles from "@/app/_styles/Button.module.css";
import Image from "next/image";
import UIDisplayInfo from "./UIStateDisplay"
import view from "@/app/ui/see.svg";
import profile from "@/app/ui/avatarFill.svg";
import deleteUser from "@/app/ui/trashcan.svg";
import CryptoJS from 'crypto-js';

export default function StudentsTable({ group_id, actions }) {
  const pathname = usePathname();
  const router = useRouter();
  const [groupID, setGroupId] = useState(group_id);
  const [students, setStudents] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [currentPage, setCurrentPage] = useState(1); 
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoadingData] = useState(true); 
  const [errorLoading, setErrorLoad] = useState(false);
  const itemsPerPage = 6;

  const encryptData = (data) => {
    return CryptoJS.AES.encrypt(JSON.stringify(data), process.env.NEXT_PUBLIC_ENCRYPT_KEY).toString();
  };

  const fetchCount = async () => {
    const userType = pathname === "/student/groups" ? "student" : "teacher";
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_HOST}/${userType}/groups/members/total?var_group_id=${group_id}`,{
        headers: {
          "auth-token": localStorage.getItem("auth-token"),
        },
      });
      const data = await response.json();
      if (response.ok) {
        const totalStudents = data[0].get_group_students_count;
        const calculatedTotalPages = Math.ceil(totalStudents / itemsPerPage);
        setTotalPages(calculatedTotalPages);
      } else {
        console.error("Error al obtener el total de estudiantes de un profesor:", data.message);
      }
    } catch (error) {
      setErrorLoad(true);
    }
  };

  const getStudents = async (ingroup_id,page_number,page_size) => {
    const userType = pathname === "/student/groups" ? "student" : "teacher";
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_HOST}/${userType}/groups/members`,
        {
          method: "POST",
          headers: {
            "auth-token": localStorage.getItem("auth-token"),
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            var_group_id: ingroup_id,
            var_page_number: page_number,
            var_page_size: page_size  
        })
        }
      );
      const data = await response.json();
      if (response.ok) {
        setErrorLoad(false);
        setStudents(data);
      }
    } catch (error) {
      setErrorLoad(true);
    } finally {
      setLoadingData(false); // Set loading state to false after fetch is done
    }
  };

  const removeStudent = async(inGroup_id, inStudent_id) => {
    const userType = pathname === "/student/groups" ? "student" : "teacher";
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_HOST}/${userType}/groups/members/remove`,
        {
          method: "POST",
          headers: {
            "auth-token": localStorage.getItem("auth-token"),
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            var_group_id: inGroup_id,
            var_student_user_id: inStudent_id  
        })
        }
      );
      const data = await response.json();
      console.log(data);
      if (data[0].delete_student_from_group) {
        getStudents(groupID,currentPage,itemsPerPage);
        alert("Estudiante eliminado del grupo con éxito.");
      }
      else{
        alert("No se ha podido borrar al estudiante.")
      }
    } catch (error) {
      alert("Ha ocurrido un error al intentar eliminar al estudiante.");
    }
  }

  const handleStatsClick = (studentID) => {
    sessionStorage.setItem('student',
      encryptData(studentID)
    );
    router.push("/teacher/groups/stats");
  }

  const handleDeleteClick = (student_id) =>{
    removeStudent(group_id,student_id);
  }

  useEffect(() => {
    getStudents(groupID,currentPage,itemsPerPage);
  }, [currentPage, groupID]);

  useEffect(() => {
    setLoadingData(true);
    setErrorLoad(false);
    setGroupId(group_id);
    fetchCount();
    setCurrentPage(1);
  }, [group_id]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleRetryLoad = () => {
    setLoadingData(true);
    setErrorLoad(false);
    setGroupId(group_id);
    fetchCount();
    getStudents(groupID,currentPage,itemsPerPage);
  }

  //UI for loading data
  if (loading) {
    return (
      <UIDisplayInfo
        title="Cargando..."
      />
    )
  }

  if(errorLoading){
    return(
      <><UIDisplayInfo
        title="Error"
        message="Hubo un error al cargar los estudiantes" />
        <div style={{ width: '100%', display: 'flex', justifyContent: 'center', marginBottom: '1vw' }}>
          <button
            className={buttonStyles.primary}
            onClick={handleRetryLoad}
          >
            Reintentar
          </button>
        </div></>
    )
  }

  //If there are no students in the data state
  if (students.length === 0) {
    return (
      <>
        <UIDisplayInfo
          title="Estudiantes"
          message="No hay estudiantes en este grupo"
        />
      </> 
    )
  }

  return (
    <><div className={styles.container}>
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Nombre completo</th>
            {actions === true ? <><th>Estadísticas</th><th>Perfil</th><th>Eliminar</th></> : <></>}
          </tr>
        </thead>
        <tbody>
          {students.map((student, index) => (
            <tr key={index}>
              <td>{(currentPage - 1) * itemsPerPage + index + 1}</td>
              <td>{student.student_name}</td>
              {actions === true ? (
                <>
                  <td>
                    <button aria-label={`Ver estadísticas del estudiante: ${student.student_name}`}
                      onClick={() => handleStatsClick(student.student_id)}>
                      <Image src={view} alt="" />
                    </button>
                  </td><td>
                    <button aria-label={`Ver perfil del estudiante: ${student.student_name}`}
                      onClick={() => {
                        router.push(`/teacher/groups/info/student-info?student_id=${student.student_id}`);
                      } }>
                      <Image src={profile} alt="" />
                    </button>
                  </td>
                  <td>
                    <button aria-label={`Eliminar estudiante: ${student.student_name}`}
                      onClick={() => handleDeleteClick(student.student_id) }>
                      <Image src={deleteUser} alt="" />
                    </button>
                  </td>
                </>
              ) : (
                <></>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div><div className={styles.buttonContainer}>
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={buttonStyles.primary}
          aria-label="Estudiantes: anterior página"
        >
          Anterior
        </button>
        <span>
          Página {currentPage} de {totalPages}
        </span>
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={buttonStyles.primary}
          aria-label="Estudiantes: siguiente página"
        >
          Siguiente
        </button>
      </div></>
  );
}
