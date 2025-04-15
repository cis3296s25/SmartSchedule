import React, {useState} from 'react';
import ScheduleRestrictions from './ScheduleRestrictions'; 

function SemesterSelector({semester, setSemester, termCode, setTermCode, setSelectedCourses}) {
    const [showDropdown, setShowDropdown] = useState(false);

    // predefined semester options and Banner term codes
    const semesters = [
        {label: "Fall 2024", code: "202436"},
        {label: "Spring 2025", code: "202503"},
        {label: "Summer I 2025", code: "202520"},
        {label: "Summer II 2025", code: "202526"},
        {label: "Fall 2025", code: "202536"}
    ];


    const handleSelect = (sem) => {
        setSemester(sem.label);
        setTermCode(sem.code);
        setSelectedCourses([]);
        setShowDropdown(false);
    };


    return (
        <div className="stacked">
            <div>
                <h3>Semester</h3>
                <p>Choose your semester from the dropdown below.</p>

                <input
                    type="text"
                    placeholder="Select semester"
                    value={semester}
                    onFocus={() => setShowDropdown(true)}
                    onChange={() => {
                    }} // optional: prevent manual typing 
                />

                {showDropdown && (
                    <ul className="dropdown">
                        {semesters.map((sem, index) => (
                            <li key={index} onClick={() => handleSelect(sem)}>
                                {sem.label}
                            </li>
                        ))}
                    </ul>
                )}
            </div>

    
                <ScheduleRestrictions/>
            
        </div>
    );
}

export default SemesterSelector;



