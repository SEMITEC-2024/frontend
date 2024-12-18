"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import GroupsScreen from "@/app/components/view-groups";
import styles from "@/app/_styles/CreateLesson.module.css";
import buttonStyles from "@/app/_styles/Button.module.css";
import UIDisplayInfo from "@/app/components/UIStateDisplay"
import CryptoJS from 'crypto-js';
import { useEffect } from "react";

export default function TeacherLessonAssign() {
  const router = useRouter();
  const [submiting, setSubmitting] = useState(false);
  const [validEntry, setValidEntry] = useState();
  const decryptData = (cipherText) => {
    const bytes = CryptoJS.AES.decrypt(cipherText, process.env.NEXT_PUBLIC_ENCRYPT_KEY);
    return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
  };

  const createAssignLessonAPI = async (inBody) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_HOST}/teacher/lesson/create/assign/bulk`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "auth-token": localStorage.getItem("auth-token"),
          },
          body: inBody,
        }
      );
      const data = await response.json();
        if (data[0].successcode) {
          sessionStorage.removeItem('checkedStudents');
          sessionStorage.removeItem('lesson');
          alert("Lección creada y asignada con éxito");
          router.push("/teacher/home");
        }
        else{
          alert("Algo ha salido mal al crear la lección, inténtelo de nuevo más tarde.");
        }
    } catch (error) {
      console.log(error);
      alert("Ha ocurrido un error al crear la lección, inténtelo de nuevo más tarde.")
    }
  };

  const createAssignLesson = async() =>{
    setSubmitting(true);
    const saved = sessionStorage.getItem('checkedStudents');
    const lessonContent = sessionStorage.getItem('lesson');
    const decryptedArray = decryptData(saved);
    const decryptedLesson = JSON.parse(decryptData(lessonContent));//Parsing into an object
    
    //Check if there are students that were assigned and check for an existing lesson to assign them to.
    if(decryptedArray.length > 0 && decryptedLesson && typeof decryptedLesson === 'object'){
      decryptedLesson.students_ids = decryptedArray;
      const fullData = JSON.stringify(decryptedLesson);
      await createAssignLessonAPI(fullData);
    } else if(decryptedArray.length === 0) {
      alert("Elija al menos a 1 estudiante para asignar una lección"); 
    }
    setSubmitting(false);
  }

  const handleOnCancelClick = () =>{
    sessionStorage.removeItem('checkedStudents');
    sessionStorage.removeItem('lesson');
    router.push("/teacher/lessons/create");
  }

  useEffect(()=>{
    const studentId = sessionStorage.getItem('lesson');
    if (studentId) {
      setValidEntry(true);
      } else {
        setValidEntry(false);
      }
  },[]);
  
  if(!validEntry){
    return(
      <UIDisplayInfo
        title="Error: No autorizado"
        message="Para crear y asignar una lección utilice la de creación de actividades.">
      </UIDisplayInfo>
    )
  }

  return (
    <main>
      <div style={{textAlign:'center', margin: '0'}}>
        <h1 className={styles.title} style={{marginBottom: '0'}}>Asignar a estudiantes</h1>
      </div>
      <GroupsScreen usage={"Assignment"} />
      <div className={styles.buttonContainer}>
          <button className={buttonStyles.secondary} onClick={handleOnCancelClick}>
            Cancelar
          </button>
          <button id="validate-button" className={buttonStyles.primary} onClick={createAssignLesson} disabled={submiting}>
            Asignar
          </button>
      </div>
    </main>
  );
}