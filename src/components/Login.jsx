import React,{useState} from "react";
import {useNavigate} from "react-router-dom";
import axios from "axios";
import {jwtDecode} from "jwt-decode";
function Login(){
    const backend="https://quizo-backend-5cck.onrender.com";
    const navigate=useNavigate();
    const[username,setUsername]=useState("");
    const[pass,setPass]=useState("");
    const[error,setError]=useState("");
    async function userLogin(e){
        e.preventDefault();
        try{
            const result=await axios.post(`${backend}/api/users/login`,{username,pass});
            setError(result.data.message);
            if(result.data.message==="login successful"){
                const decodedToken=jwtDecode(result.data.token);
                localStorage.setItem("user_id",decodedToken.Id);
                localStorage.setItem('token',result.data.token);
                navigate('/homepage');
            }
        }catch(err){
            setError('login failed');
            console.error(err.message);
        }
    }
    return(
        <div className="Logincontainer">
            <div className="name">
                <h2>Welcome Back...</h2>
            </div>
            <form onSubmit={userLogin} className="form">
                <input type="text" placeholder="Enter UserName" value={username} onChange={(e)=>setUsername(e.target.value)} required />
                <input type="password" placeholder="Enter Password" value={pass} onChange={(e)=>setPass(e.target.value)} required />
                <div className="Registerbuttonclass">
                    <button type="submit">Login</button>
                    <button type="button" onClick={()=>navigate('/')}>New user? Register here...</button>
                </div>
            </form>
            {error && <p className="message">{error}</p>}
        </div>
    )
}
export default Login;