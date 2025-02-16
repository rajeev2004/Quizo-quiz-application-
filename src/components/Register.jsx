import React,{useState} from "react";
import {useNavigate} from "react-router-dom";
import axios from "axios";
import {jwtDecode} from "jwt-decode";
function Register(){
    const backend="https://quizo-backend-5cck.onrender.com";
    const navigate=useNavigate();
    const[name,setName]=useState("");
    const[pass,setPass]=useState("");
    const[error,setError]=useState("");
    async function userRegister(e){
        e.preventDefault();
        try{
            const result=await axios.post(`${backend}/api/users/register`,{name,pass});
            setError(result.data.message);
            if(result.data.message==="user registered"){
                const decodedToken=jwtDecode(result.data.token);
                localStorage.setItem("user_id",decodedToken.Id);
                localStorage.setItem('token',result.data.token);
                navigate('/homepage');
            }else{
                alert('Try again');
            }
        }catch(err){
            setError('registration failed');
        }
    }
    return(
        <div className="Registercontainer">
            <div className="name">
                <h2>Quizo: quiz platform</h2>
            </div>
            <form className="form" onSubmit={userRegister}>
                <input type="text" placeholder="Enter Username" value={name} onChange={(e)=>setName(e.target.value)} required />
                <input type="password" placeholder="Enter Password" value={pass} onChange={(e)=>setPass(e.target.value)} required />
                <div className="Registerbuttonclass">
                    <button type="submit">Register</button>
                    <button type="button" onClick={()=>navigate('/login')}>Already have an account?</button>
                </div>
            </form>
            {error && <p className="message">{error}</p>}
        </div>
    )
}
export default Register;