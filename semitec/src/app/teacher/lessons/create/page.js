"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import styles from "@/app/_styles/CreateLesson.module.css";
import info from "@/app/ui/info-circle.svg";
import buttonStyles from "@/app/_styles/Button.module.css";
import UIDisplayInfo from "@/app/components/UIStateDisplay";
import CryptoJS from 'crypto-js';
import UILoading from "@/app/components/misc/loading"

export default function CreatLesson() {
  const LESSON_KEY = "lesson";
  const EXPIRY_TIME = 20 * 1000;

  const router = useRouter();
  const [name, setName] = useState("");
  const [level_id, setLevelID] = useState();
  const [content, setContent] = useState("");
  const [description, setDescription] = useState("");
  const [max_time, setMaxTime] = useState("");
  const [max_mistakes, setMaxMistakes] = useState("");
  const [iterations, setIterations] = useState("1");  
  const [publicActivity, setPublicActivity] = useState(false);
  const [available_lexemes, setLexemes] = useState([]);
  const [available_levels, setAvLevels] = useState([]);
  const [loading, setLoading] = useState(false);

  const encryptData = (data) => {
    return CryptoJS.AES.encrypt(JSON.stringify(data), process.env.NEXT_PUBLIC_ENCRYPT_KEY).toString();
  };

  const decryptData = (cipherText) => {
    const bytes = CryptoJS.AES.decrypt(cipherText, process.env.NEXT_PUBLIC_ENCRYPT_KEY);
    return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
  };

  //Checks if the lesson in sessionStorage has expired.
  //If it's still valid, then loads the data back into the UI. Otherwise, nothing.
  const loadPreviousData = () => {
    const lessonContent = sessionStorage.getItem(LESSON_KEY);
    if(lessonContent){
      const now = new Date().getTime();
      //Try to manipulate the data. Catch any errors.
      try{
        const data = JSON.parse(decryptData(lessonContent));
        if (now > data.expiry) {
          sessionStorage.removeItem(LESSON_KEY);
          return false;
        }
        else{
          setName(data.name);
          setDescription(data.description);
          setContent(data.content);
          setMaxTime(data.max_time);
          setMaxMistakes(data.max_mistakes);
          setIterations(data.iterations);
          setLevelID(data.level_id);
          if(data.shared == '1'){
            setPublicActivity(true);
          }
        }
      }
      catch(error){
        //Catch errors trying to parse the encrypted data.
        sessionStorage.removeItem(LESSON_KEY);
        return false;
      }
    }
  }

  const assignLesson = () => {
    const now = new Date().getTime();
    var sharedvalue = 0;
    if(publicActivity){sharedvalue = 1}
    sessionStorage.setItem(LESSON_KEY,
      encryptData(
      JSON.stringify({
        level_id: level_id,
        content: content,
        iterations: iterations,
        max_time: max_time,
        max_mistakes: max_mistakes,
        name: name,
        description: description,
        shared: sharedvalue,
        expiry: now + EXPIRY_TIME
      })
    ));
    sessionStorage.removeItem('checkedStudents');
    router.push("/teacher/lessons/create/assign");
  }

  const getLexemes = async() => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_HOST}/lessons/lexemes`);
      const data = await response.json();
      const lexemeNames = data.map(item => item.lexeme_name);
      setLexemes(lexemeNames);
    } catch (error) {
      console.log(error);
    }
  };

  const getLevels = async() => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_HOST}/lessons/levels`);
      const data = await response.json();
      const levelsData = data.map(item => ({
        level_id: item.level_id,
        name: item.name, }));
      setAvLevels(levelsData);
      if (levelsData.length > 0) {
        setLevelID(levelsData[0].level_id);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleChangeName = (event) => {
    setName(event.target.value);
  };
  const handleChangeWords = (event) => {
    setContent(event.target.value);
  };
  const handleChangeDescription = (event) => {
    setDescription(event.target.value);
  };
  const handleChangeMaxTime = (event) => {
    if(event.target.value >= 0 && event.target.value.length <= 4)
      setMaxTime(event.target.value);
  };
  const handleChangeMaxMistakes = (event) => {
    if(event.target.value >= 0 && event.target.value.length <= 2)
      setMaxMistakes(event.target.value);
  };
  const handleChangeIterations = (event) => {
    if(event.target.value >= 0 && event.target.value.length <= 2)
      setIterations(event.target.value);
  }
  const handleChangeLevel = (event) => {
    setLevelID(event.target.value);
  };
  const handleChangePublic = (event) => {
    setPublicActivity(event.target.checked);
  }

  const handleClickLex = (lexeme) => {
    if(content.length!=0){
      setContent(content + ' ' + lexeme);
    }
    else{
      setContent(lexeme);
    }
  };

  const handleCancel = () => {
    sessionStorage.removeItem(LESSON_KEY);
    router.push('/teacher/home');
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await getLexemes();
      await getLevels();
      loadPreviousData();
      setLoading(false);
    };
    
    fetchData();
  },[]);

  const validateForms = () => {
    if(iterations==="0"){
      alert('Se requiere de mínimo 1 iteración.'); 
    }
    else if(max_time==="0"){
      alert('Se requiere de mínimo 1 segundo de límite de tiempo.');
    }
    else{
      const leftForm = document.getElementById('left-form');
      const rightForm = document.getElementById('right-form');
      if (leftForm.checkValidity() && rightForm.checkValidity() && level_id) {
        assignLesson();
      }
      else { 
          alert('Verifique que todos los campos estén llenos.'); 
        } 
    }
  };

  if (loading) {
    return (
      <UILoading
      />
    )
  }

  return (
    <div className={styles.parent}>
      <div className={styles.container}>
        <div>
          <h1 className={styles.title}>Crear Actividad</h1>
        </div>
        <div style={{display: 'flex', justifyContent: 'center'}}>
          <div className={styles.leftContainer}>
          <form id="left-form">
            <h2 className={styles.sectionHeader}>Información de la lección</h2>
            <label htmlFor="name" className={styles.formsLabel}>Nombre</label>
            <input
              required
              value={name}
              className={styles.formsInput}
              placeholder="Ingrese el nombre de la actividad"
              minLength={1}
              maxLength={16}
              onChange={handleChangeName}
              type="text"
              id="name"
            />
            <label htmlFor="description" className={styles.formsLabel}>Descripción</label>
            <textarea
              required
              value={description}
              className={styles.formsInput}
              placeholder="Ingrese la descripción de la actividad"
              rows="5"
              minLength={1}
              maxLength={256}
              onChange={handleChangeDescription}
              type="text"
              id="description"
            />
            <label htmlFor="words" className={styles.formsLabel}>Contenido de la Lección</label>
            <textarea
              required
              value={content}
              className={styles.formsInput}
              placeholder="Ingrese el contenido de la actividad"
              rows="5"
              minLength={1}
              maxLength={256}
              onChange={handleChangeWords}
              type="text"
              id="words"
            />
          </form>
          </div>
          <div className={styles.midContainer}>
            <h2 className={styles.sectionHeader}>Lexemas disponibles</h2>
            <p className={styles.sectionHeader} style={{marginTop: '-1vw'}}>(Opcional)</p>
            <div className={styles.lexemesContainer}>
              <div className={styles.lexemesContent}>
              {available_lexemes.length === 0 ? (
              <p className={styles.formsLabel}>No hay lexemas disponibles</p>
              ) : (
                available_lexemes.map((lexeme, index) => (
                  <button
                    className={styles.buttnedText}
                    style={{background:"var(--background)"}}
                    key={index}
                    onClick={() => handleClickLex(lexeme)}> 
                    <p style={{color:"var(--foreground)", margin:'0'}}>{lexeme}</p>
                  </button>
                ))
              )}
              </div>
            </div>
          </div>
          <div className={styles.rightContainer}>
          <form id="right-form">
            <h2 className={styles.sectionHeader}>Personalización de la lección</h2>
            <label htmlFor="min_time" className={styles.formsLabel}>Límite de tiempo (Segundos)</label>
            <input
              required
              value={max_time}
              className={styles.formsInput}
              placeholder="Ingrese el tiempo máximo"
              minLength={1}
              maxLength={4}
              onChange={handleChangeMaxTime}
              type="number"
              id="min_time"
            />
            <label htmlFor="min_mistakes" className={styles.formsLabel}>Cantidad máxima de errores</label>
            <input
              required
              value={max_mistakes}
              className={styles.formsInput}
              placeholder="Ingrese el máximo de errores permitidos"
              minLength={1}
              onChange={handleChangeMaxMistakes}
              type="number"
              id="min_mistakes"
            />

            <label htmlFor="iterations" className={styles.formsLabel}>Iteraciones</label>
            <input
              required
              placeholder="Ingrese las iteraciones del contenido"
              value={iterations}
              className={styles.formsInput}
              minLength={0}
              onChange={handleChangeIterations}
              type="number"
              id="iterations"
            />
            <label htmlFor="level_id" className={styles.formsLabel}>Nivel</label>
            <select
              id="level_id"
              style={{width:'95%'}}
              className={styles.formsInput}
              value={level_id}
              onChange={handleChangeLevel}
            >
              {available_levels.length === 0 ? (
                <option disabled>Error obteniendo los niveles</option>
              ) : ( available_levels.map((level) => (
                <option
                  key={level.level_id}
                  value={level.level_id}>
                    {level.name}
                </option> 
               )) 
              )}
            </select>
            <div style={{display: 'flex', alignItems: 'center'}}>
              <input
              style={{width: '4vh', height: '4vh', margin: '1vw'}}
              type="checkbox"
              checked={publicActivity}
              className={styles.formsInput}
              onChange={handleChangePublic}
              id="publicActivity"
              alt="Marque esta casilla si desea que la actividad sea pública y cualquier usuario pueda realizarla."
              />
              <label
                htmlFor="publicActivity"
                className={styles.formsLabel}
                style={{ flexGrow: 1, marginLeft: '10px', whiteSpace: 'nowrap'}}>
                  Actividad pública
              </label>
              <div className={styles.tooltip}>
                <Image 
                  src={info} 
                  alt="" 
                  style={{ maxHeight: '4vh', maxWidth: '4vh', marginLeft: '10px' }} 
                />
                <span className={styles.tooltipText}>
                  <p className={styles.formsLabel}>
                    Marque esta casilla si desea que su actividad sea pública y cualquier otro usuario pueda completarla.
                  </p>
                </span>
              </div>
            </div>
            </form>
          </div>
        </div>
        <div className={styles.buttonContainer}>
          <button className={buttonStyles.secondary} onClick={handleCancel}>
            Cancelar
          </button>
          <button id="validate-button" className={buttonStyles.primary} onClick={validateForms}>
            Crear actividad
          </button>
        </div>
      </div>
    </div>
  );
}
