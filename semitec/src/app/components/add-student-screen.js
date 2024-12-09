"use client";
import styles from "./add-student-screen.module.css";
import stylesTable from "@/app/_styles/GroupsTable.module.css";
import "./add-student-screen.module.css";
import { Formik, Field, Form, ErrorMessage } from 'formik';
import buttonStyles from "@/app/_styles/Button.module.css";
import { useEffect, useState } from "react";
import UIDisplayInfo from "./UIStateDisplay"
import { useSearchParams } from "next/navigation";
import Dialog from "@/app/components/modularPopup/modularpopup";

export default function LeesonsScreen() {
  const [studentsDB, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [currentPage, setCurrentPage] = useState(1); 
  const [totalPages, setTotalPages] = useState(1); 
  const itemsPerPage = 5; 
  const [loading, setLoadingData] = useState(true); 
  const [errorLoading, setErrorLoad] = useState(false); 
  const [provinces, setProvinces] = useState([])
  const [cantons, setCantons] = useState([])
  const [districts, setDistricts] = useState([])
  const [institutions, setInstitutions] = useState([])
  const [selectedProvince, setSelectedProvince] = useState("")
  const [selectedCanton, setSelectedCanton] = useState("")
  const [selectedDistrict, setSelectedDistrict] = useState("")
  const [selectedInstitution, setSelectedInstitution] = useState(null)
  const [selectedFilteredInstitution, setSelectedFilteredInstitution] = useState("")
  const [name, setName] = useState("") 
  const searchParams = useSearchParams();
  //DIALOG
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
  
  const fetchCount = async (var_name,var_institution_id,var_group_id) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_HOST}/teacher/groups/students/filter/total`,{
        method: "POST",
          headers: {
            "auth-token": localStorage.getItem("auth-token"),
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ 
            var_name: var_name,
            var_institution_id: var_institution_id,
            var_group_id: var_group_id
        })
        }
      );
      const data = await response.json();
      if (response.ok) {
        const totalStudents = data[0].get_students_by_name_and_institution_count;
        const calculatedTotalPages = Math.ceil(totalStudents / itemsPerPage);
        setTotalPages(calculatedTotalPages);
      } else {
        console.error("Error al obtener el total de estudiantes según el filtro:", data.message);
      }
    } catch (error) {
      setErrorLoad(true);
    }
  };
  const getStudents = async (var_name,var_institution_id,var_group_id,var_page_number,var_page_size) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_HOST}/teacher/groups/students/filter`,{
          method: "POST",
          headers: {
            "auth-token": localStorage.getItem("auth-token"),
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ 
            var_name: var_name,
            var_institution_id: var_institution_id,
            var_group_id: var_group_id,
            var_page_number: var_page_number,
            var_page_size: var_page_size
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
      console.log(error);
    } finally {
      setLoadingData(false);  
    }
  };

 
  useEffect(() => {
    getStudents(name,selectedFilteredInstitution,searchParams.get("group_id"),currentPage,itemsPerPage)
  }, [currentPage]);

  useEffect(() => {
    setErrorLoad(false);
    getProvinces()
    .then( (res) => res.json())
    .then(data => setProvinces(data))          
    .catch( (err) => {
      throw new Error(
        `Unable to Fetch Data from provinces.`
      )
    })
    setLoadingData(false); 
  }, [])

  useEffect(() => {
    if (selectedProvince){
      getCantons()
      .then( (res) => res.json())
      .then(data => setCantons(data))          
      .catch( (err) => {
        throw new Error(
          `Unable to Fetch Data from Provinces.`
        )
      })
    }
  }, [selectedProvince])

  useEffect(() => {
    if (selectedCanton){
      getDistricts()
      .then( (res) => res.json())
      .then(data => setDistricts(data))          
      .catch( (err) => {
        throw new Error(
          `Unable to Fetch Data from Districts.`
        )
      })
    }
  }, [selectedCanton])

  useEffect(() => {
    if (selectedDistrict){
      getInstitutions()
      .then( (res) => res.json())
      .then(data => setInstitutions(data))          
      .catch( (err) => {
        throw new Error(
          `Unable to Fetch Data from Institutions.`
        )
      })
    }
  }, [selectedDistrict])
       
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };
  const handleRadioChange = (userId) => {
    setSelectedStudent(userId); 
  };

  const handleAssignStudent = async () => {
    if (!selectedStudent) {
      alert("Por favor, seleccione un estudiante.");
      return;
    }   
    try {
      const groupId = searchParams.get("group_id");
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_HOST}/teacher/groups/students/add`,{
        method: "POST",
        headers: {
          "auth-token": localStorage.getItem("auth-token"),
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          var_group_id: groupId,
          var_user_id: selectedStudent
      })
      });
      console.log(response)
      if (response.ok) {
        setCurrentPage(1);
        fetchCount(name, selectedFilteredInstitution, searchParams.get("group_id"))
        getStudents(name, selectedInstitution, searchParams.get("group_id"), currentPage, itemsPerPage)
        setModalTitle("Éxito");
        setModalMessage("Estudiante asignado exitosamente al grupo.");
        setShowOverlay(true);
      } else {
        const error = await response.json();
        alert(`Error al asignar el estudiante: ${error.message}`);
      }
    } catch (error) {
      alert(`Error de red al asignar el estudiante: ${error.message}`);
    }
  };
  const handleProvinceChange = (event) => {
    const selectedValue = event.target.value; 
    setSelectedProvince(selectedValue);
    setSelectedCanton("");
    setSelectedDistrict("");
    setSelectedInstitution(null);
  };

  const handleCantonChange = (event) => {
    const selectedValue = event.target.value; 
    setSelectedCanton(selectedValue);
    setSelectedDistrict("");
    setSelectedInstitution(null);
  };
  const handleDistrictChange = (event) => {
    const selectedValue = event.target.value; 
    setSelectedDistrict(selectedValue);
    setSelectedInstitution(null);
  };
  const handleInstitutionChange = (event) => {
    const selectedValue = event.target.value; 
    setSelectedInstitution(selectedValue);
  };
  const initialValues = {
    name: "",
    lastName: "",
    province: "",
    canton: "",
    district: "",
    institution: ""
  };

  const handleSubmit = (values, setSubmitting) => {
    const nombre = values.name;
    const apellido = values.lastName;
    let tname="";
    if (nombre !== "" && apellido !== "") {
      setName(nombre + " " + apellido);  
      tname=nombre + " " + apellido;
    } else if (nombre !== "") {
      setName(nombre); 
      tname=nombre;
    } else if (apellido !== "") {
      setName(apellido); 
      tname=apellido;
    } else {
      setName("");
      tname="";
    }
    setCurrentPage(1);
    setSelectedFilteredInstitution(selectedInstitution);
    fetchCount(tname, selectedInstitution, searchParams.get("group_id"))
      .then(() => getStudents(tname, selectedInstitution, searchParams.get("group_id"), currentPage, itemsPerPage))
      .finally(() => setSubmitting(false)); 
  };

  const getProvinces= async() => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_HOST}/provinces?country_id=${1}`); 
    if (!response.ok) {
      throw new Error(
        `Unable to Fetch Data.`
      );
    }
    return response
  };

  const getCantons = async() => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_HOST}/cantons?province_id=${selectedProvince}`); 
    if (!response.ok) {
      throw new Error(
        `Unable to Fetch Data.`
      );
    }
    return response
  };

  const getDistricts = async() => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_HOST}/districts?canton_id=${selectedCanton}`); 
    if (!response.ok) {
      throw new Error(
        `Unable to Fetch Data.`
      );
    }
    return response
  };

  const getInstitutions = async() => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_HOST}/institutions?country_id=${selectedDistrict}`); 
    if (!response.ok) {
      throw new Error(
        `Unable to Fetch Data.`
      );
    }
    return response
  };

  if (loading) {
    return (
      <UIDisplayInfo
        title="Cargando..."
      />
    )
  }

  return (
    <div>
        <div className={styles.MainContainer}>
            <Formik 
            initialValues={initialValues}
            
            onSubmit={(values, { setSubmitting }) => handleSubmit(values, setSubmitting)}
            >
            {({ isSubmitting, values }) => (
                <Form>
                <div className={styles.leftContainer}>
                    {/* Filtros de búsqueda */}
                    <h1 style={{fontSize: "2.1vw"}}>Filtros de búsqueda</h1>
                    <div className={styles.FormContainer}>
                        <div className={styles.inputGroup}>
                            <label>Nombre</label>
                            <Field 
                                className={styles.inputFieldRow}
                                type="text" 
                                name="name" 
                                placeholder="Ingrese el nombre"
                            />
                            <ErrorMessage className="error-message" name="name" component="div" />
                        </div>

                        <div className={styles.inputGroup}>
                            <label>Apellido</label>
                            <Field 
                                className={styles.inputFieldRow}
                                type="text" 
                                name="lastName" 
                                placeholder="Ingrese el apellido"
                            />
                            <ErrorMessage className="error-message" name="lastName" component="div" />
                        </div>
                    </div>
                    <div className={styles.FormUbicationContainer}>
                      <div className={styles.inputGroup}>
                        <label>Provincia</label>
                        <Field 
                          as="select" 
                          name="province" 
                          className={styles.inputField} 
                          value={selectedProvince} 
                          onChange={handleProvinceChange}
                        >
                          <option value="">Seleccione una provincia</option>
                          {provinces.length > 0 ? (
                            provinces.map((province) => (
                              <option key={province.province_id} value={province.province_id}>
                                {province.name}
                              </option>
                            ))
                          ) : (
                            <option value="" disabled>Cargando provincias...</option>
                          )}
                        </Field>
                        <ErrorMessage className="error-message" name="province" component="div" />
                      </div>
                      <div className={styles.inputGroup}>
                        <label>Cantón</label>
                        <Field 
                          as="select" 
                          name="canton" 
                          className={styles.inputField} 
                          value={selectedCanton} 
                          onChange={handleCantonChange}
                          disabled={selectedProvince === ""}
                        >
                          <option value="">Seleccione un cantón</option>
                          {cantons.length > 0 ? (
                            cantons.map((canton) => (
                              <option key={canton.canton_id} value={canton.canton_id}>
                                {canton.name}
                              </option>
                            ))
                          ) : (
                            <option value="" disabled>Cargando cantones...</option>
                          )}
                        </Field>
                        <ErrorMessage className="error-message" name="canton" component="div" />
                      </div>
                      <div className={styles.inputGroup}>
                        <label>Distrito</label>
                        <Field 
                          as="select" 
                          name="district" 
                          className={styles.inputField} 
                          value={selectedDistrict} 
                          onChange={handleDistrictChange}
                          disabled={selectedProvince === ""||selectedCanton === ""}
                        >
                          <option value="">Seleccione un distrito</option>
                          {cantons.length > 0 ? (
                            districts.map((district) => (
                              <option key={district.district_id} value={district.district_id}>
                                {district.name}
                              </option>
                            ))
                          ) : (
                            <option value="" disabled>Cargando distritos...</option>
                          )}
                        </Field>
                        <ErrorMessage className="error-message" name="district" component="div" />
                      </div>
                      <div className={styles.inputGroup}>
                        <label>Institución</label>
                        <Field 
                          as="select" 
                          name="institution" 
                          className={styles.inputField} 
                          value={selectedInstitution} 
                          onChange={handleInstitutionChange}
                          disabled={selectedProvince === ""||selectedCanton === ""||selectedDistrict === ""}
                        >
                          <option value="">Seleccione una institución</option>
                          {cantons.length > 0 ? (
                            institutions.map((institution) => (
                              <option key={institution.institution_id} value={institution.institution_id}>
                                {institution.name}
                              </option>
                            ))
                          ) : (
                            <option value="" disabled>Cargando instituciones...</option>
                          )}
                        </Field>
                        <ErrorMessage className="error-message" name="institution" component="div" />
                      </div>
                    </div> 
                    <div className={styles.buttonContainer}>
                      <button type="submit" className={buttonStyles.primary} disabled={
                            isSubmitting || 
                            (
                              selectedInstitution === null && // No hay institución seleccionada
                              (values.name.trim().length < 3 && values.lastName.trim().length < 3) // Ambos son menores de 3 caracteres
                            )
                          }>
                          Aplicar Filtros
                      </button>
                    </div>
                </div>
                </Form>
            )}
            </Formik>
            <div className={styles.rightContainer}>
              {studentsDB.length > 0 ? (
                <>
                <div className={styles.tableContainer}>
                  <div className={stylesTable.container}>
                    <table>
                      <thead>
                        <tr>
                          <th>Nombre completo</th>
                          <th>Asignar</th>
                        </tr>
                      </thead>
                      <tbody>
                        {studentsDB.map((student, index) => (
                          <tr key={index}>
                            <td>{student.name}</td>
                            <td>
                              <input
                                style={{ width: '4vh', height: '4vh', margin: '1vw' }}
                                type="radio"
                                name="selectedStudent" 
                                checked={selectedStudent === student.user_id} 
                                onChange={() => handleRadioChange(student.user_id)}
                                alt={`Incluir a ${student.name} en el grupo.`}
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
                <div className={styles.buttonContainerMain}>
                  <div className={styles.buttonContainer}>
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className={buttonStyles.primary}
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
                      >
                        Siguiente
                      </button>
                  </div>
                  <div className={stylesTable.buttonContainer}>
                      <button
                        onClick={handleAssignStudent}
                        disabled={!selectedStudent}
                        className={buttonStyles.primary}
                      >
                        Asignar Estudiante al Grupo
                      </button>
                  </div>
                </div>
                </>
                ) : (
                  <>
                  <div className={styles.emptyTable}>
                    <h3 style={{ fontSize: '1.5em', color: '#333' }}>🔍 Sin resultados</h3>
                    <p>No hay datos de estudiantes para mostrar.</p>
                  </div>
                  </>
                )}
            </div>
        </div>
        <Dialog
          title={modalTitle}
          message={modalMessage}
          onConfirm={handleOverlayAccept}
          show={showOverlay}
          showCancel={false}
        />
    </div>
  );
};

