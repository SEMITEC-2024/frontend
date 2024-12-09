"use client";
import { useEffect, useRef, useState } from "react";
import styles from "@/app/_styles/LessonResults.module.css";
import buttonStyles from "@/app/_styles/Button.module.css";

export default function LessonResults({
  metrics,
  showMetrics,
  handleContinue,
  handleBack,
  restrictions,
}) {
  const [message, setMessage] = useState("");
  const dialogRef = useRef(null);

  useEffect(() => {
    if (showMetrics) {
      dialogRef.current?.showModal();
    } else {
      dialogRef.current?.close();
    }

    if (
      metrics.mistakes > restrictions.min_mistakes &&
      metrics.time_taken > restrictions.min_time
    ) {
      setMessage(
        "Lo estás haciendo excelente. Debes mejorar el tiempo y la precisión."
      );
    } else if (
      metrics.mistakes > restrictions.min_mistakes &&
      metrics.time_taken <= restrictions.min_time
    ) {
      setMessage("¡Tu tiempo es excelente! Debes mejorar la precisión.");
    } else if (
      metrics.mistakes <= restrictions.min_mistakes &&
      metrics.time_taken > restrictions.min_time
    ) {
      setMessage("¡Tu precisión es excelente! Debes mejorar el tiempo .");
    } else {
      setMessage("¡Tu precisión y tiempo son excelentes, sigue así!");
    }
  }, [showMetrics]);

  return (
    <dialog
      className={styles.wrapper}
      ref={dialogRef}
      aria-labelledby="results-title"
    >
      <h1 id="results-title" className={styles.title}>
        Resultados de la lección
      </h1>
      <div className={styles.contentWrapper}>
        <p>{message}</p>
        <p><strong>Tiempo</strong>: {metrics.time_taken} segundos</p>
        <p><strong>Errores</strong>: {metrics.mistakes}</p>
        <p><strong>Precisión</strong>: {metrics.accuracy_rate} %</p>
        <p><strong>Pulsaciones por minuto</strong>: {metrics.pulsation_per_minute}</p>
        <p><strong>Pulsaciones válidas</strong>: {metrics.valid_keystrokes}</p>
      </div>
      <div className={styles.interactionContainer}>
        <button
          className={buttonStyles.secondary}
          onClick={handleBack
          }
        >
          Volver a lecciones
        </button>
        <button
          className={buttonStyles.primary}
          onClick={handleContinue}
        >
          Repetir lección
        </button>
      </div>
    </dialog>
  );
}
