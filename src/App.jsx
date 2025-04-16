/* global scheduler */
import {useState, useRef} from 'react';
import './App.css';
import axios from "axios";
import logo from "./assets/templelogo.png";
import SemesterSelector from "./components/SemesterSelector.jsx";
import GeneratedSchedules from "./components/GeneratedSchedules.jsx";
import CourseSearch from './components/CourseSearch';
import SelectedCourses from "./components/SelectedCourses.jsx";
import NavBar from "./components/NavBar.jsx";

function App() {
    const [message, setMessage] = useState('');
    const [selectedCourses, setSelectedCourses] = useState([]);
    const [semester, setSemester] = useState('');
    const [termCode, setTermCode] = useState('202503') // defaults to Spring 2025
    const [loadingSchedules, setLoadingSchedules] = useState(false);
    const [schedule, setSchedule] = useState({});
    const schedulerContainerRef = useRef(null);


    const handleGeneration = async () => {
        setLoadingSchedules(true);

        try {

            // fetch full section data for each selected course
            const courseFetchPromises = selectedCourses.map(course => {
                const [subject] = course.code.split(" ");
                return axios.get("http://localhost:8000/api/subject/courses", {
                    params: {
                        subject,
                        term_code: termCode
                    }
                });
            });

            // run all subject fetches in parallel
            const courseResponses = await Promise.all(courseFetchPromises);

            // flatten results into full course data
            const fullCourses = [];

            selectedCourses.forEach((course, index) => {
                const courseList = courseResponses[index].data.courses;
                const matching = courseList.find(c => c.CRN === course.CRN); // match by section
                if (matching) {
                    fullCourses.push(matching);
                }
            });


            console.log("Course preview:", fullCourses.map(c => ({
                code: c.code,
                CRN: c.CRN,
                professor: c.professor,
                meetingTimes: c.meetingTimes
              })));
              

            // call generate API
            const response = await axios.post("http://localhost:8000/api/generate", {
                courses: fullCourses
            });

            console.log("✅ Schedules:", response.data);
            setSchedule(response.data);
        } catch (error) {
            console.error("Error generating schedules:", error);
        } finally {
            setLoadingSchedules(false);
        }
    };


    return (
        <>
            <NavBar />

            <div > 
                <h1> <br/><br/> Temple University<br/> Course Schedule Generator<br/></h1>
            </div>

            <div class = "center">
                <div className="container">

                    <SemesterSelector
                        semester={semester}
                        setSemester={setSemester}
                        termCode={termCode}
                        setTermCode={setTermCode}
                        setSelectedCourses={setSelectedCourses}
                    />

                    <CourseSearch
                        termCode={termCode}
                        selectedCourses={selectedCourses}
                        setSelectedCourses={setSelectedCourses}
                        setMessage={setMessage}
                    />

                    <SelectedCourses
                        selectedCourses={selectedCourses}
                        setSelectedCourses={setSelectedCourses}
                    />

                <SelectedCourses
                    selectedCourses={selectedCourses}
                    setSelectedCourses={setSelectedCourses}
                />
                

                </div>

            <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' , justifyContent: 'center'}}>
            <button onClick={handleGeneration} disabled={loadingSchedules}>
                {loadingSchedules ? <i>Generating...</i> : "Generate Schedules"}
            </button>

            
            </div>
            

            <GeneratedSchedules schedule={schedule} schedulerContainerRef={schedulerContainerRef} isLoading={loadingSchedules}/>

        </>
    );


}

export default App;

