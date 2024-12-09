import "./profile-data.css";
import Image from "next/image";
import contrast from "@/assets/bg_images/location.svg";
import emailIcon from "@/assets/bg_images/email.svg";
import briefcase from "@/assets/bg_images/briefcase.svg";

import avatar from "@/app/ui/avatar.svg";

export default function Profile({
  username,
  institution,
  user_type,
  email,
  country,
  province,
  canton,
  district
}) {
  return (
    <>
      <div className="flex-container">
        <div className="icon"></div>
        <div className={"data-container card-container-theme"}>
          <div className="header-format">      
            {username==="" ?(
                <div className="card">
                  <div className="card__skeleton card__address"></div>    
                </div>      
              ):(
                <div className="name-format">{username}</div>
              )}
              {institution==="" ?(
                <div className="card">
                  <div className="card__skeleton card__title"></div>    
                </div>      
              ):(
                <div className="institution-format">{institution}</div>
              )}
            
          </div>

          <div>
            <div className="body-line">
              <Image src={briefcase} alt="" />
              {user_type==="" ?(
                <div className="card">
                  <div className="card__skeleton card__title"></div>    
                </div>      
              ):(
                <div className="data">{user_type}</div>
              )}
            </div>
            <div className="body-line">
              <Image src={emailIcon} alt="" />
              {email==="" ?(
                <div className="card">
                  <div className="card__skeleton card__title"></div>    
                </div>      
              ):(
                <div className="data">{email}</div>
              )}       
            </div>
            <div className="body-line">
              <Image src={contrast} alt="" />
              {district==="" ?(
                <div className="card">
                  <div className="card__skeleton card__address"></div>    
                </div>      
              ):(
                <div className="data">
                  {country}, {province}, {canton}, {district}
                </div>
              )}     
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
