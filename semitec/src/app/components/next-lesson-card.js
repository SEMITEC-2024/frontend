import styles from '@/app/_styles/NextLessonCard.module.css'

export default function NextLessonCard({ handleStartLesson, lesson_id }) {
  return (
    <article className={`${styles.container} card-container-theme`}>
      <div>
        <div className={styles.title}>Siguiente lección</div>
        <div className={styles.info}>Lección {lesson_id}</div>
      </div>
      <button className={styles.button} onClick={handleStartLesson}>Iniciar</button>
    </article>
  );
}
