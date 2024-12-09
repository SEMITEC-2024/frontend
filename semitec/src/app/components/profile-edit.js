"use client";
import styles from "./profile-edit.module.css";
import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import buttonStyles from "@/app/_styles/Button.module.css";
import InfoComponent from "@/app/components/UIStateDisplay";
import Dialog from "./modularPopup/modularpopup";
import UILoading from "./misc/loading"

export default function ProfileEdit({
    inUsername,
    inInstitution,
    inEducationalLevel,
    inDateOfBirth,
    inEmail,
    inCountry,
    inProvince,
    inCanton,
    inDistrict,
    inOtherSigns}
){
    const router = useRouter();
    const pathname = usePathname();
    const userType = pathname === "/student/profile" ? "student" : "teacher";

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [otherSigns, setOtherSigns] = useState("");
    const [dateOfBirth, setDoB] = useState();

    const [countries, setCountries] = useState([])
    const [provinces, setProvinces] = useState([])
    const [cantons, setCantons] = useState([])
    const [districts, setDistricts] = useState([])
    const [educationLevels, setEducationLevels] = useState([])
    const [institutions, setInstitutions] = useState([])
    const [selectedCountry, setSelectedCountry] = useState()
    const [selectedProvince, setSelectedProvince] = useState()
    const [selectedCanton, setSelectedCanton] = useState()
    const [selectedDistrict, setSelectedDistrict] = useState()
    const [selectedInstitution, setSelectedInstitution] = useState() 
    const [selectedEducationLevel, setSelectedEducationLevel] = useState();
    const [maxDate, setMaxDate] = useState('');
    const [userInteraction, setUserInteraction] = useState(false);
    const [loading, setLoadingStatus] = useState(false);
    const [loadError, setLoadError] = useState(false);
    const [minorError, setMinorError] = useState(false);

    //Dialog
    const [showOverlay, setShowOverlay] = useState(false);
    const [modalTitle, setModalTitle] = useState();
    const [modalMessage, setModalMessage] = useState();

    const firstLoad = async() => {
        setLoadingStatus(true);
        try{
        let countryId, provinceId, cantonId, districtId, institutionId, edLevelId;

        //Getting countries and selecting the one that matches the name provided.
        const countriesRes = await getCountries();
        const countriesData = await countriesRes.json()
        setCountries(countriesData)
        const matchingCountry = countriesData.find(country => country.name === inCountry);
        if (matchingCountry) {
            countryId = matchingCountry.country_id;
        }
        if (countryId) {
            //Getting provinces and selecting the one that matches the name provided.
            const provincesRes = await getProvinces(countryId);
            const provincesData = await provincesRes.json()
            setProvinces(provincesData);
            const matchingProvince = provincesData.find(province => province.name === inProvince);
            if (matchingProvince) {
                provinceId = matchingProvince.province_id;
            }
            
            if (provinceId) {
                //Getting cantons and selecting the one that matches the name provided.
                const cantonsRes = await getCantons(provinceId);
                const cantonsData = await cantonsRes.json();
                setCantons(cantonsData);
                const matchingCanton = cantonsData.find(canton => canton.name === inCanton);
                if (matchingCanton) {
                    cantonId = matchingCanton.canton_id;
                }

                if (cantonId) {
                    //Getting districts and selecting the one that matches the name provided.
                    const districtsRes = await getDistricts(cantonId);
                    const districtsData = await districtsRes.json();
                    setDistricts(districtsData);
                    const matchingDistrict = districtsData.find(district => district.name === inDistrict);
                    if (matchingDistrict) { 
                        districtId = matchingDistrict.district_id;
                    }
                    else{console.log(`No se encontraron coincidencias de distrito ${inDistrict}. Ubicación: ${matchingCountry.name}, ${matchingProvince.name}, ${matchingCanton.name}`)}
                }
            }

            //Instituciones habiendo obtenido el país.
            const institutionRes = await getInstitutions(countryId);
            const institutionsData = await institutionRes.json();
            setInstitutions(institutionsData);
            const matchingInstitution = institutionsData.find(inst => inst.name === inInstitution);
            if(matchingInstitution){
                institutionId = matchingInstitution.institution_id
            }
        }
        setSelectedCountry(countryId);
        setSelectedProvince(provinceId);
        setSelectedCanton(cantonId);
        setSelectedDistrict(districtId);
        setSelectedInstitution(institutionId);

        //Extra actions if the user is an student
        if(userType=="student"){
            const educationLvlRes = await getEducationLevels();
            const educationLvlData = await educationLvlRes.json();
            setEducationLevels(educationLvlData);
            const matchingEdLvl = educationLvlData.find(edlvl => edlvl.name === inEducationalLevel);
            if(matchingEdLvl){
                edLevelId = matchingEdLvl.education_level_id;
                setSelectedEducationLevel(edLevelId);
            }
            setDates();
            const formatted = inDateOfBirth.split('T')[0];
            setDoB(formatted);
        }
        setLoadingStatus(false);
        setLoadError(false);
        }catch(error){
            console.log(error);
            setLoadingStatus(false);
            setLoadError(true);
        }
    }

    const setDates = () => {
        const today = new Date().toISOString().split('T')[0];
        setMaxDate(today);
    }

    const handleCancel = () => {
        router.push(`/${userType}/home`);
    };

    const validateForms = () => {
        const leftForm = document.getElementById('left-form');
        const midForm = document.getElementById('mid-form');
        const rightForm = document.getElementById('right-form');        
        if (leftForm.checkValidity() && midForm.checkValidity() && rightForm.checkValidity()) {
            if(!validateEmail(email)){
                alert("Verifique la dirección de correo ingresada") 
            }
            else if(password.length > 0 && password.length < 6){
                alert("La contraseña debe tener mínimo 6 caracteres")
            }
            else{
                if(userType=="teacher"){
                    updateDataTeacher();
                }
                else{
                    updateDataStudent();
                }
            }
        } else {
            if(userType=="student"){
                const inputDate = new Date(dateOfBirth);
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                if(inputDate > today){
                    alert("Fecha de nacimiento no válida");
                }
                else{
                    alert('Verifique que todos los campos estén llenos.');
                }
            }
            else{
                alert('Verifique que todos los campos estén llenos.'); 
            }
          }
    }

    const validateEmail = (emailval) => {
        const regex = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;
        return regex.test(emailval);
    };

    const updateDataTeacher = async() => {
        try {
            let inBody = {
                institution_id: selectedInstitution,
                district_id: selectedDistrict,
                name: name,
                email: email,
                other_signs: otherSigns
            }
            //If a password was provided, push it.
            if(password.length > 0){
                inBody.password = password;
            }
           
            const response = await fetch(
              `${process.env.NEXT_PUBLIC_API_HOST}/teacher/profile/update`,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  "auth-token": localStorage.getItem("auth-token"),
                },
                body: JSON.stringify(inBody),
              }
            );
            const data = await response.json();
            if(data.update_teacher){
                setModalTitle("Éxito");
                setModalMessage("Información actualizada con éxito");
                setShowOverlay(true);
            }
            else{
                setModalTitle("Fallo");
                setModalMessage("Ha ocurrido un error al intentar actualizar la información.");
                setShowOverlay(true);
            }
        }catch(error){
            setModalTitle("Fallo");
            setModalMessage("Ha ocurrido un error al intentar actualizar la información.");
            setShowOverlay(true);
        }
    }

    const updateDataStudent = async() => {
        try {
            let inBody = {
                institution_id: selectedInstitution,
                district_id: selectedDistrict,
                name: name,
                email: email,
                other_signs: otherSigns,
                date_birth: dateOfBirth,
                education_level_id: selectedEducationLevel
            }
            //If a password was provided, push it.
            if(password.length > 0){
                inBody.password = password;
            }
           
            const response = await fetch(
              `${process.env.NEXT_PUBLIC_API_HOST}/student/profile/update`,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  "auth-token": localStorage.getItem("auth-token"),
                },
                body: JSON.stringify(inBody),
              }
            );
            const data = await response.json();
            if(data.update_student){
                setModalTitle("Éxito");
                setModalMessage("Información actualizada con éxito");
                setShowOverlay(true);
            }
            else{
                setModalTitle("Fallo");
                setModalMessage("Ha ocurrido un error al intentar actualizar la información.");
                setShowOverlay(true);
            }
        }catch(error){
            setModalTitle("Fallo");
            setModalMessage("Ha ocurrido un error al intentar actualizar la información.");
            setShowOverlay(true);
        }
    }

    const getCountries = async() => {
        const response = fetch(`${process.env.NEXT_PUBLIC_API_HOST}/countries`)
        return response
    };
    
    const getProvinces = async(inSelectedCountry) => {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_HOST}/provinces?country_id=${inSelectedCountry}`); 
        if (!response.ok) {
          throw new Error(
            `Unable to Fetch Data.`
          );
        }
        return response;
      };
    
    const getCantons = async(inSelectedProvince) => {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_HOST}/cantons?province_id=${inSelectedProvince}`); 
        if (!response.ok) {
          throw new Error(
            `Unable to Fetch Data.`
          );
        }
        return response
      };
    
    const getDistricts = async(inSelectedCanton) => {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_HOST}/districts?canton_id=${inSelectedCanton}`); 
        if (!response.ok) {
          throw new Error(
            `Unable to Fetch Data.`
          );
        }
        return response
    };

    const getInstitutions = async(inSelectedCountry) => {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_HOST}/institutions?country_id=${inSelectedCountry}`); 
        if (!response.ok) {
          throw new Error(
            `Unable to Fetch Data.`
          );
        }
        return response
    }

    const getEducationLevels = async() => {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_HOST}/education-levels`); 
        if (!response.ok) {
          throw new Error(
            `Unable to Fetch Data.`
          );
        }
        return response
    };

    const handleChangeName = (event) => {
        setName(event.target.value);
    };

    const handleChangeEmail = (event) => {
        setEmail(event.target.value);
    };
    
    const handleChangePassword = (event) => {
        setPassword(event.target.value);
    };

    const handleChangeDoB = (event) => {
        setDoB(event.target.value);
    }
    
    const handleChangeCountry = (event) => {
        setUserInteraction(true);
        setSelectedCountry(event.target.value);
    };

    const handleChangeProvince = (event) => {
        setUserInteraction(true);
        setSelectedProvince(event.target.value);
    };

    const handleChangeCanton = (event) => {
        setUserInteraction(true);
        setSelectedCanton(event.target.value);
    };

    const handleChangeDistrict = (event) => {
        setUserInteraction(true);
        setSelectedDistrict(event.target.value);
    };

    const handleChangeOtherSigns = (event) => {
        setOtherSigns(event.target.value);
    }

    const handleChangeInstitution = (event) => {
        setSelectedInstitution(event.target.value);
    };

    const handleChageEdLevel = (event) => {
        setSelectedEducationLevel(event.target.value);
    }

    const handleOverlayAccept = () => {
        setShowOverlay(false);
    }

    //Initializing
    useEffect(() => {
        setLoadingStatus(true);
        setName(inUsername);
        setEmail(inEmail);
        setOtherSigns(inOtherSigns);
        firstLoad();
    }, [])

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
    
    useEffect(() => {
    if (userInteraction && selectedCountry){
        getProvinces(selectedCountry)
        .then( (res) => res.json())
        .then(data => { 
            setProvinces(data);
            setSelectedProvince(data[0].province_id);
        })          
        .catch( (err) => {
            setMinorError(true);
        })
    }
    }, [selectedCountry])

    useEffect(() => {
        if (userInteraction && selectedProvince){
          getCantons(selectedProvince)
          .then( (res) => res.json())
          .then(data => {
            setCantons(data);
            setSelectedCanton(data[0].canton_id);
        })          
          .catch( (err) => {
            setMinorError(true);
          })
        }
    }, [selectedProvince])
    
    useEffect(() => {
    if (userInteraction && selectedCanton){
        getDistricts(selectedCanton)
        .then( (res) => res.json())
        .then(data => {
            setDistricts(data)
            setSelectedDistrict(data[0].district_id);
            setMinorError(false);
        })          
        .catch( (err) => {
            setMinorError(true);
        })
    }
    }, [selectedCanton])

    if (loading) {
        return (
          <UILoading
          />
        )
      }
    if(loadError){
        return(
            <div className={styles.parent}>
            <div className={styles.container}>
                <div style={{display: 'flex', justifyContent: 'center'}}>
                <div className={styles.midContainer}>
                    <InfoComponent title={"Error de conexión"} message={"Ha ocurrido un error cargando la información.\nInténtelo de nuevo más tarde"} ></InfoComponent>
                    <div>
                        <button className={buttonStyles.primary} onClick={firstLoad} disabled={loading}>Reintentar</button>
                    </div>
                    </div>
                </div>
                </div>
            </div>
        )
    }
    return(
        <div className={styles.parent}>
            <div className={styles.container}>
                <div>
                    <h1 className={styles.title}>Editar información personal</h1>
                </div>
                <div style={{display: 'flex', justifyContent: 'center'}}>
                    <div className={styles.leftContainer}>
                        <form id="left-form">
                        <h2 className={styles.sectionHeader}>Información personal</h2>
                            <label htmlFor="name" className={styles.formsLabel}>Nombre</label>
                            <input
                                required
                                value={name}
                                className={styles.formsInput}
                                placeholder="Ingrese su nombre"
                                minLength={1}
                                maxLength={64}
                                onChange={handleChangeName}
                                type="text"
                                id="name"
                            />
                            <label htmlFor="email" className={styles.formsLabel}>Correo</label>
                            <input
                                required
                                value={email}
                                className={styles.formsInput}
                                placeholder="Ingrese su correo electrónico"
                                minLength={1}
                                maxLength={31}
                                onChange={handleChangeEmail}
                                type="text"
                                id="email"
                            />
                            <label htmlFor="password" className={styles.formsLabel}>Contraseña (Opcional)</label>
                            <input
                                value={password}
                                className={styles.formsInput}
                                placeholder="Ingrese la nueva contraseña."
                                minLength={0}
                                maxLength={30}
                                onChange={handleChangePassword}
                                type="text"
                                id="password"
                            />
                            {password.length > 0 &&(
                                <p style={{marginTop: '0'}}>Mínimo 6 caracteres.</p>
                            )}
                            {userType === "student" && (
                            <>
                            <label htmlFor="date" className={styles.formsLabel}>Fecha de nacimiento</label>
                            <input
                                type="date"
                                id="date"
                                value={dateOfBirth}
                                className={styles.formsInput}
                                onChange={handleChangeDoB}
                                name="date"
                                min="1930-01-01"
                                max={maxDate}
                                required />
                            </>
                            )}
                        </form>
                    </div>
                    <div className={styles.midContainer}>
                        <form id="mid-form">
                        <h2 className={styles.sectionHeader}>Información de residencia</h2>
                        <label htmlFor="country" className={styles.formsLabel}>País</label>
                        <select
                            id="country"
                            value={selectedCountry}
                            className={styles.formsInput}
                            onChange={(e) => {
                                console.log("EVENT!");
                                handleChangeCountry(e);
                            }}
                        >
                        {countries && Array.isArray(countries)? 
                        countries.map( 
                            (country) => {
                            return <option
                                key={country.country_id}
                                value={country.country_id}>
                                {country.name}
                                </option>
                            }
                        ):<></>
                        }
                      </select>

                      <label htmlFor="province" className={styles.formsLabel}>Provincia</label>
                        <select
                            id="province"
                            value={selectedProvince}
                            className={styles.formsInput}
                            onChange={(e) => {
                                handleChangeProvince(e);
                            }}
                        >
                        {provinces && Array.isArray(provinces)? 
                        provinces.map( 
                            (province) => {
                            return <option
                                key={province.province_id}
                                value={province.province_id}>
                                {province.name}
                                </option>
                            }
                        ):<></>
                        }
                      </select>

                      <label htmlFor="canton" className={styles.formsLabel}>Cantón</label>
                        <select
                            id="canton"
                            value={selectedCanton}
                            className={styles.formsInput}
                            onChange={(e) => {
                                handleChangeCanton(e);
                            }}
                        >
                        {cantons && Array.isArray(cantons)? 
                        cantons.map( 
                            (canton) => {
                            return <option
                                key={canton.canton_id}
                                value={canton.canton_id}>
                                {canton.name}
                                </option>
                            }
                        ):<></>
                        }
                      </select>

                      <label htmlFor="district" className={styles.formsLabel}>Distrito</label>
                        <select
                            id="district"
                            value={selectedDistrict}
                            className={styles.formsInput}
                            onChange={(e) => {
                                handleChangeDistrict(e);
                            }}
                        >
                        {districts && Array.isArray(districts)? 
                        districts.map( 
                            (district) => {
                            return <option
                                key={district.district_id}
                                value={district.district_id}>
                                {district.name}
                                </option>
                            }
                        ):<></>
                        }
                        </select>
                        <label htmlFor="extra" className={styles.formsLabel}>Otras señas</label>
                            <input
                            required
                            value={otherSigns}
                            className={styles.formsInput}
                            placeholder="Ingrese otras señas"
                            minLength={1}
                            maxLength={120}
                            onChange={handleChangeOtherSigns}
                            type="text"
                            id="extra"
                            />
                    </form>
                    </div>
                        
                    <div className={styles.rightContainer}>
                        <form id="right-form">
                        <h2 className={styles.sectionHeader}>Información educativa</h2>
                        <label htmlFor="institution" className={styles.formsLabel}>Institución</label>
                        <select
                            id="institution"
                            value={selectedInstitution}
                            className={styles.formsInput}
                            onChange={(e) => {
                                handleChangeInstitution(e);
                            }}
                        >
                        {institutions && Array.isArray(institutions)? 
                        institutions.map( 
                            (inst) => {
                            return <option
                                key={inst.institution_id}
                                value={inst.institution_id}>
                                {inst.name}
                                </option>
                            }
                        ):<></>
                        }
                      </select>
                      {userType === "student" && (
                        <>
                        <label htmlFor="edLevel" className={styles.formsLabel}>Nivel Educativo</label>
                        <select
                            id="edLevel"
                            value={selectedEducationLevel}
                            className={styles.formsInput}
                            onChange={(e) => { handleChageEdLevel(e); }} > {
                                educationLevels && Array.isArray(educationLevels) ? 
                                educationLevels.map(edLevel => ( 
                                <option
                                    key={edLevel.education_level_id} 
                                    value={edLevel.education_level_id} >
                                        {edLevel.name} 
                                </option> )
                            ) : <></> 
                            } </select> 
                            </> 
                        )}
                        </form>
                    </div>
                </div>
                {minorError && (
                    <div>
                        <p>{"Ha ocurrido un error al obtener información.\nLos datos podrían no ser precisos."}</p>
                    </div>
                )}
                <div className={styles.buttonContainer}>
                    <button className={buttonStyles.secondary} onClick={handleCancel}>
                        Regresar
                    </button>
                    <button id="validate-button" className={buttonStyles.primary} onClick={validateForms} disabled={minorError}>
                        Guardar cambios
                    </button>
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
}