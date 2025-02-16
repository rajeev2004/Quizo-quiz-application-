import React,{useState,useEffect} from "react"
import {useNavigate} from "react-router-dom";
import axios from "axios"
function Dashboard(){
    const navigate=useNavigate();
    const backend="https://quizo-backend-5cck.onrender.com";
    const [quiz,setQuiz]=useState({
        title:'',
        description:'',
        questions:[{
            questionText:'',
            options:["","","",""],
            correctChoice:0
        }]
    });
    const [editingQuiz,setEditingQuiz]=useState(null);
    const [quizzes,setQuizzes]=useState([]);
    useEffect(()=>{
        if(localStorage.getItem('user_id')){
            fetchQuizzes();
        }     
    },[]);
    async function fetchQuizzes(){
        try{
            const response=await axios.get(`${backend}/api/users/quizzes/${localStorage.getItem('user_id')}`);
            setQuizzes(response.data);
        }catch(err){
            console.error(err.message);
        }
    }
    function handleChange(e){
        setQuiz({...quiz,[e.target.name]:e.target.value});
    }
    function questionChange(qIndex,e){
        const Question=[...quiz.questions];
        Question[qIndex].questionText=e.target.value;
        setQuiz({...quiz,questions:Question});
    }
    function answerChange(aIndex,e,qIndex){
        const Question=[...quiz.questions];
        Question[qIndex].options[aIndex]=e.target.value;
        setQuiz({...quiz,questions:Question});
    }
    function setCorrectAnswer(qIndex,e){
        const Question=[...quiz.questions];
        Question[qIndex].correctChoice=parseInt(e.target.value);
        setQuiz({...quiz,questions:Question});
    }
    function AddQuestion(){
        setQuiz({...quiz,questions:[...quiz.questions,{questionText:'',options:["","","",""],
            correctChoice:0}]})
    }
    async function handleSubmit(e){
        e.preventDefault();
        try{
            const result=await axios.post(`${backend}/api/users/quizzes/${localStorage.getItem('user_id')}`,{
                title:quiz.title,
                description:quiz.description
            });
            for(const question of quiz.questions){
                const questionResponse=await axios.post(`${backend}/api/users/questions/${localStorage.getItem('user_id')}`,{
                    quiz_id:result.data[0].quiz_id,
                    question_text:question.questionText
                });
                for(let i=0;i<question.options.length;i++){
                    await axios.post(`${backend}/api/users/answers/${localStorage.getItem('user_id')}`,{
                        question_id:questionResponse.data[0].question_id,
                        answer_text:question.options[i],
                        is_correct:i===question.correctChoice,
                    })
                }
            }
            alert('Quiz created successfully');
            fetchQuizzes();
            setQuiz({
                title:'',
                description:'',
                questions:[{
                    questionText:'',
                    options:["","","",""],
                    correctChoice:0
                }]
            });
        }catch(err){
            console.error(err.message);
        }
    }
    function logout(){
        localStorage.removeItem('user_id');
        localStorage.removeItem('token');
        navigate('/');
    }
    async function handleUpdateQuiz(e){
        e.preventDefault();
        try{
            await axios.put(`${backend}/api/users/quizzes/${editingQuiz.quiz_id}`,editingQuiz);
            alert('quiz successfully updates');
            setEditingQuiz(null);
            fetchQuizzes();
        }catch(err){
            console.error(err);
        }
    }
    async function handleDeleteQuiz(quizId){
        if(window.confirm("Are you sure you want to delete this quiz?")){
            try{
                await axios.delete(`${backend}/api/users/quizzes/${quizId}`);
                alert("quiz deleted successfully!");
                fetchQuizzes();
            }catch(err){
                console.error(err);
            }
        }
    }
    function handleEditClick(quiz){
        setEditingQuiz({...quiz});
    }
    return(
        <div className="dashboardContainer">
            <h2>Welcome To Quizo</h2>
            <div className="logout">
                <button type="button" onClick={logout}>Logout</button>
            </div>
            <form onSubmit={handleSubmit} className="form">
                <h2>Create A quiz</h2>
                <input type="text" name="title" placeholder="Enter Title" value={quiz.title} onChange={handleChange} required />
                <input type="text" name="description" placeholder="Enter Description" value={quiz.description} onChange={handleChange} required />
                <div className="addQuestion">
                {quiz.questions.map((question,index)=>(
                    <div key={index} className="dashboardContainerChild">
                        <h3 style={{margin:"10px 10px"}}>Question {index+1}:</h3>
                        <input type="text" placeholder="Enter the question" value={question.questionText} onChange={(e)=>questionChange(index,e)} required />
                        {question.options.map((answer,answerIndex)=>(
                            <div key={answerIndex}>
                                <input type="text" placeholder="Enter option" value={answer} onChange={(e)=>answerChange(answerIndex,e,index)} required />
                            </div>
                        ))}
                        <label><h3 style={{marginBottom:"10px"}}>Correct Answer:</h3></label>
                        <select value={question.correctChoice} onChange={(e)=>setCorrectAnswer(index,e)}>
                            {question.options.map((option,optionIndex)=>(
                                <option key={optionIndex} value={optionIndex}>
                                    {`option ${optionIndex+1}`}
                                </option>
                            ))}
                        </select>
                    </div>
                ))}
                </div>
                <div className="dashboardFormButton">
                    <button type="button" onClick={AddQuestion}>Add Question</button>
                    <button type="submit">Submit Quiz</button>
                </div>
            </form>
            <hr />
            <h2>Your Quizzes:</h2>
            <div className="yourQuizContainer">
            {quizzes.length===0?(
                <p>No quizzes created yet.</p>
            ):(
                quizzes.map((quizItem)=>(
                    <div key={quizItem.quiz_id} className="everyQuiz">
                        {editingQuiz && editingQuiz.quiz_id===quizItem.quiz_id?(
                            <form onSubmit={handleUpdateQuiz} className="editForm">
                                <div className="editFormDetails">
                                    <h2>Edit Quiz</h2>
                                    <div className="editQuiz">
                                        <label>Title: </label>
                                        <input type="text" value={editingQuiz.title} onChange={(e)=>setEditingQuiz({...editingQuiz,title:e.target.value})} required />
                                    </div>
                                    <div className="editQuiz">
                                        <label>Description: </label>
                                        <input type="text" value={editingQuiz.description} onChange={(e)=>setEditingQuiz({...editingQuiz,description:e.target.value})} required />
                                    </div>
                                </div>
                                <div className="allEditQuestion">
                                {editingQuiz.questions.map((question,qIndex)=>(
                                    <div key={qIndex} className="editQuizQuestion">
                                            <div className="editQuestion">
                                                <div className="editQuiz">
                                                    <label>Question {qIndex+1}: </label>
                                                    <input type="text" value={question.question_text} onChange={(e)=>{
                                                        const updatedQuestions=[...editingQuiz.questions];
                                                        updatedQuestions[qIndex].question_text=e.target.value;
                                                        setEditingQuiz({...editingQuiz,questions:updatedQuestions});
                                                    }} />
                                                </div>
                                            </div>
                                            <h4 style={{margin:"5px 5px"}}>Options:</h4>
                                            <div className="quizOption">
                                            {question.options.map((option,optIndex)=>(
                                                <div key={optIndex} className="editQuizOption">
                                                    <input type="text" value={option.answer_text} onChange={(e)=>{
                                                        const updatedQuestions=[...editingQuiz.questions];
                                                        updatedQuestions[qIndex].options[optIndex].answer_text=e.target.value;
                                                        setEditingQuiz({...editingQuiz,questions:updatedQuestions});
                                                    }}/>
                                                    <input type="checkbox" checked={option.is_correct} onChange={(e)=>{
                                                        const updatedQuestion=[...editingQuiz.questions];
                                                        updatedQuestion[qIndex].options[optIndex].is_correct=e.target.checked;
                                                        setEditingQuiz({...editingQuiz,questions:updatedQuestion})
                                                    }}/>
                                                </div>
                                            ))}
                                            </div>
                                        </div>
                                ))}
                                </div>
                                <button type="submit">Update Quiz</button>
                                <button type="button" onClick={()=>setEditingQuiz(null)}>Cancel</button>
                            </form>
                        ):(
                            <div className="quizChildContainer">
                                <div className="quizDetails">
                                    <h3>Title: {quizItem.title}</h3>
                                    <h3>Description: {quizItem.description}</h3>
                                </div>
                                <div className="quizChildContainerButton">
                                    <button onClick={()=>handleEditClick(quizItem)}>Edit</button>
                                    <button onClick={()=>handleDeleteQuiz(quizItem.quiz_id)}>Delete</button>
                                </div>
                                <h3>Questions:</h3>
                                {quizItem.questions.map((question,index)=>(
                                    <div key={index} className="quizElements">
                                        <p>
                                            <strong>Q {index+1}: </strong>
                                            {question.question_text}
                                        </p>
                                        <ul>
                                            {question.options.map((option,optIndex)=>(
                                                <li key={optIndex}>
                                                    <p>{option.answer_text} {option.is_correct?"(correct Answer)":""}</p>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )))}
            </div>
        </div>
    )
}
export default Dashboard;