"use client";
import { useEffect, useState, React } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Formik, Form, Field, ErrorMessage } from "formik";
import Dialog from "@/app/components/modularPopup/modularpopup";
import "./Login.css";
import "../components/button/button.css";
import buttonStyle from "@/app/_styles/Button.module.css";

export default function Login({ }) {
    const router = useRouter();
    //Dialog
    const [showOverlay, setShowOverlay] = useState(false);
    const [modalTitle, setModalTitle] = useState();
    const [modalMessage, setModalMessage] = useState();

    const handleOverlayAccept = () => {
        setShowOverlay(false);
    }

    //Watch for the event of escape key when the dialog is opened, then remove the listener.
    useEffect(() => {
        const handleKeyDown = (event) => {
        if (event.key === 'Escape') {
            setShowOverlay(false);
        }
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => {
        document.removeEventListener('keydown', handleKeyDown);
        };
    }, []);

    const login = async (credentials) => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_HOST}/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(credentials),
            });
            if (!res.ok) {
                setModalTitle("Aviso");
                setModalMessage("Usuario o contraseña incorrectas");
                setShowOverlay(true);
            } else {
                const data = await res.json();
                const token = res.headers.get("auth-token");

                if (token) {
                    localStorage.setItem("auth-token", token);
                    if (data.user_type_name === "Estudiante") {
                        router.push(`student/home`);
                    } else if (data.user_type_name === "Tutor") {
                        router.push(`teacher/home`);
                    }
                }
            }
        } catch (error) {
            console.log(error);
        }
    };

    return (
        <div className="login-container">
            <section className="bg-size" alt="Imagen azul decorativa en el fondo">
                <div className="details-container">
                    <h1 className="login-left-side-header">SEMITEC</h1>
                    <text className="login-left-side-text">
                        Sistema de enseñanza de la mecanografía
                    </text>
                    <text className="login-left-side-text">
                        para personas con discapacidad visual.{" "}
                    </text>
                    <text className="login-left-side-text">
                        Con excelencia en mente, del TEC para{" "}
                    </text>
                    <text className="login-left-side-text">Costa Rica. </text>
                </div>
            </section>
            <section className="login-size">
                <div className="logo-img" />
                <div className="login-right-side">
                    <h1 className="login-header">Iniciar sesión</h1>
                    <Formik
                        initialValues={{ password: "", email: "" }}
                        validate={(values) => {
                            const errors = {};
                            if (!values.email) {
                                errors.email = "Correo requerido.";
                            } else if (
                                !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(values.email)
                            ) {
                                errors.email = "Correo inválido.";
                            }

                            if (!values.password) {
                                errors.password = "Contraseña requerida.";
                            }

                            return errors;
                        }}
                        onSubmit={async (values, { setSubmitting }) => {  
                            await login(values);
                        
                            setSubmitting(false);
                           
                        }}
                    >
                        {({ isSubmitting }) => (
                            <Form>
                                <text className="login-text">Correo</text>
                                <Field
                                    className="form-styling"
                                    type="email"
                                    name="email"
                                    placeholder="Ingrese su correo electrónico"
                                />
                                <ErrorMessage
                                    className="error-message"
                                    name="email"
                                    component="div"
                                />
                                <text className="login-text">Contraseña</text>
                                <Field
                                    className="form-styling"
                                    type="password"
                                    name="password"
                                    placeholder="Ingrese su contraseña"
                                />
                                <ErrorMessage
                                    className="error-message"
                                    name="password"
                                    component="div"
                                />
                                <br></br>
                                <div className="button-wrap" style={{padding:'15px'}}>
                                    <button
                                        type="submit"
                                        className={buttonStyle.primary}
                                        disabled={isSubmitting}
                                    >
                                        Iniciar Sesión
                                    </button>
                                </div>
                                <div className="anchor-and-text-container">
                                    <text className="reg-text">¿Aún no tiene cuenta? &nbsp;</text>
                                    <text className="reg-text"> </text>
                                    <a href={"/signup"}>Registrarse</a>
                                </div>

                                <div className="anchor-container">
                                    <Link href={"/guest/lessons/default"}> Ingresar como invitado</Link>
                                </div>
                            </Form>
                        )}
                    </Formik>
                </div>
            </section>
        <Dialog
          title={modalTitle}
          message={modalMessage}
          onConfirm={handleOverlayAccept}
          show={showOverlay}
          showCancel={false}
        />
        </div>
    );
}
