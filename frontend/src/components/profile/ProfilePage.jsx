import React, { useState, useEffect } from 'react'; 
import { useAuth } from '../../context/AuthContext'; 
import { useNavigate } from 'react-router-dom'; 
import { toast } from 'react-toastify'; 
import UpdateProfileForm from './UpdateProfileForm'; 
import DashboardHeader from '../dashboard/DashboardHeader'; 
import './ProfilePage.css';  
 
const ProfilePage = () => { 
  const { user } = useAuth(); 
  const [isEditing, setIsEditing] = useState(false); 
  const navigate = useNavigate(); 
  
  useEffect(() => { 
    if (!user) { 
      toast.error('Please sign in to view your profile'); 
      navigate('/login'); 
    } else { 
      toast.success(`Welcome back, ${user.name}!`, { 
        position:  "top-right", 
        autoClose:  3000,
        hideProgressBar: false, 
        closeOnClick: true, 
        pauseOnHover: true,  
        draggable: true, 
      }); 
    } 
  }, [user, navigate]); 
   
  if (!user) { 
    return null; 
  } 
 
  return ( 
    <div className= "profile-container">
      <DashboardHeader /> 
      <div className= "dashboard-content">
        <div className= "dashboard-header">
           
        </div> 
        <div className ="dashboard-card">
          {!isEditing ? ( 
            <div className= "profile-info">
              <div className= "profile-header">
                <h2>Profile Information</h2> 
                <button  
                  className="edit-button" 
                  onClick={() => setIsEditing(true)} 
                > 
                  Edit Profile 
                </button> 
              </div> 
              <div className="info-grid"> 
                <div className="info-group"> 
                  <label>Name:</label> 
                  <p>{user.name}</p>  
                </div> 
                <div className="info-group"> 
                  <label>Email:</label> 
                  <p>{user.email}</p> 
                </div> 
                <div className="info-group"> 
                  <label>Phone:</label> 
                  <p>{user.phone || 'Not provided'}</p> 
                </div> 
                <div className="info-group"> 
                  <label>Address:</label> 
                  <p>{user.address || 'Not provided'}</p> 
                </div> 
                <div className="info-group"> 
                  <label>Role:</label> 
                  <span className="role-badge">{user.role}</span> 
                </div> 
              </div> 
            </div> 
          ) : ( 
            <UpdateProfileForm  
              user={user}  
              onCancel={() => setIsEditing(false)} 
            /> 
          )} 
        </div> 
      </div> 
    </div> 
  ); 
}; 

export default ProfilePage;  