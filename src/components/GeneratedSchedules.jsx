/* global scheduler */
import {useEffect, useState} from 'react';
import html2canvas from "html2canvas"; // Used to capture the DOM as an image
import jsPDF from "jspdf"; // Used to generate and export PDF files


function GeneratedSchedules({schedule, schedulerContainerRef, isLoading}) {
    const [currentScheduleIndex, setCurrentScheduleIndex] = useState(1);
    const scheduleKeys = Object.keys(schedule);

    useEffect(() => {
        if (!scheduler || !scheduler.init || !schedulerContainerRef.current) return;

        scheduler.init(schedulerContainerRef.current, new Date(), "week");
        scheduler.config.first_hour = 7;
        scheduler.config.last_hour = 23;

        if (!schedule || Object.keys(schedule).length === 0) return;

        const eventList = [];
        let eventId = 1;

        const selectedSchedule = schedule[currentScheduleIndex];
        if (!selectedSchedule) return;

        const courseColors = {};
        const colorPalette = [
            "#D9262E", "#D97826", "#E7D718", "#75C23D", "#3888C7",
            "#38C7BE"
        ];
        let colorIndex = 0;

        Object.entries(selectedSchedule).forEach(([courseCode, course]) => {
            if (!course.meetingTimes) return;

            if (!courseColors[courseCode]) {
                courseColors[courseCode] = colorPalette[colorIndex % colorPalette.length];
                colorIndex++;
            }

            course.meetingTimes.forEach((mt) => {
                mt.days.forEach((day) => {
                    const dayMap = {
                        monday: 1,
                        tuesday: 2,
                        wednesday: 3,
                        thursday: 4,
                        friday: 5,
                    };

                    if (!(day in dayMap)) return;

                    if (!mt.start || !mt.end || mt.days.length === 0) return; // skip async courses
                    const startHour = parseInt(mt.start.substring(0, 2), 10);
                    const startMin = parseInt(mt.start.substring(2), 10);
                    const endHour = parseInt(mt.end.substring(0, 2), 10);
                    const endMin = parseInt(mt.end.substring(2), 10);

                    const now = new Date();
                    const eventStart = new Date(now.setDate(now.getDate() - now.getDay() + dayMap[day]));
                    eventStart.setHours(startHour, startMin);

                    const eventEnd = new Date(eventStart);
                    eventEnd.setHours(endHour, endMin);

                    eventList.push({
                        id: eventId++,
                        text: `${course.title}`,
                        start_date: eventStart,
                        end_date: eventEnd,
                        color: courseColors[courseCode],
                    });
                });
            });
        });

        scheduler.clearAll();
        scheduler.parse(eventList, "json");
    }, [schedule, currentScheduleIndex, schedulerContainerRef]);

    const handlePrev = () => {
        if (currentScheduleIndex > 1) {
            setCurrentScheduleIndex(currentScheduleIndex - 1);
        }
    };

    const handleNext = () => {
        if (currentScheduleIndex < scheduleKeys.length) {
            setCurrentScheduleIndex(currentScheduleIndex + 1);
        }
    };

    const handleDownload = async (type) => {
        if (!schedulerContainerRef.current) return;

        const today = new Date().toISOString().split("T")[0];

        // Temporarily increase scheduler height to ensure all hours (e.g., 9–22) are visible (because screenshot only captures visible component displayed without scrolling)
        const originalHeight = schedulerContainerRef.current.style.height;
        schedulerContainerRef.current.style.height = "825px";
        scheduler.setCurrentView(); // ensure scheduler re-renders
    
        const canvas = await html2canvas(schedulerContainerRef.current, {
            scrollY: -window.scrollY,
            windowHeight: schedulerContainerRef.current.scrollHeight,
            useCORS: true
        });

        schedulerContainerRef.current.style.height = originalHeight; // restore UI
    
        // Get the schedule image
        const scheduleImg = canvas;
    
        // Prepare text info (course details)
        const selected = schedule[currentScheduleIndex];
        const textLines = [];
    
        Object.values(selected).forEach(course => {
            textLines.push(`${course.code ?? ""} - ${course.title}`); //if course.code is undefined, it won't print "undefined" in course descripton below downloaded screenshot/pdf
            textLines.push(`Professor: ${course.professor}, CRN: ${course.CRN}, Credits: ${course.creditHours}`);
            course.meetingTimes.forEach(mt => {
                textLines.push(`${mt.days.join(', ')} | ${mt.start} - ${mt.end} (${mt.type})`);
            });
            textLines.push(""); // Spacer
        });
    
        // Create a new canvas that is taller to fit text
        const extraHeight = textLines.length * 20 + 40; // Adjust spacing
        const finalCanvas = document.createElement("canvas");
        finalCanvas.width = scheduleImg.width;
        finalCanvas.height = scheduleImg.height + extraHeight;
    
        const ctx = finalCanvas.getContext("2d");
    
        // Draw the schedule image at top
        ctx.drawImage(scheduleImg, 0, 0);
    
        // Add the course info text underneath
        ctx.fillStyle = "black";
        ctx.font = "16px Arial";
        let y = scheduleImg.height + 30;
    
        textLines.forEach(line => {
            ctx.fillText(line, 20, y);
            y += 20;
        });
    
        const finalImgData = finalCanvas.toDataURL("image/png");
    
        if (type === "pdf") {
            const pdf = new jsPDF({
                orientation: "portrait",
                unit: "px",
                format: [finalCanvas.width, finalCanvas.height]
            });
    
            pdf.addImage(finalImgData, "PNG", 0, 0, finalCanvas.width, finalCanvas.height);
            pdf.save(`schedule_${today}.pdf`);
        } else {
            const link = document.createElement("a");
            link.href = finalImgData;
            link.download = `schedule_${today}.jpg`;
            link.click();
        }
    };

    // 📆 Download as ICS file
    const handleSaveICS = () => {
        if (Object.keys(schedule).length === 0) return;
    
        const scheduleIndex = currentScheduleIndex;
        const selected = schedule[scheduleIndex];
        if (!selected) return;
    
        let ics = "BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//SmartSchedule//EN\n";
    
        Object.values(selected).forEach(course => {
            course.meetingTimes.forEach(mt => {
                mt.days.forEach(day => {
                    const dayMap = {
                        monday: "MO", tuesday: "TU", wednesday: "WE",
                        thursday: "TH", friday: "FR"
                    };
                    if (!dayMap[day]) return;
    
                    const now = new Date(); // Download date
                    const startTime = mt.start.padStart(4, '0');
                    const endTime = mt.end.padStart(4, '0');
                    const dtstamp = now.toISOString().replace(/[-:.]/g, "").slice(0, 15) + "Z";
    
                    // Helper to format "0900" into "090000"
                    const formatTime = t => `${t.slice(0, 2)}${t.slice(2)}00`;
    
                    // Set semester start to "now", and align each event with correct weekday
                    const startDate = new Date();
                    const currentDay = startDate.getDay();
                    const dayOffsets = {
                        sunday: 0, monday: 1, tuesday: 2, wednesday: 3,
                        thursday: 4, friday: 5, saturday: 6
                    };
                    const targetDay = Object.keys(dayMap).find(key => dayMap[key] === dayMap[day]);
                    const offset = (dayOffsets[targetDay] + 7 - currentDay) % 7;
                    startDate.setDate(startDate.getDate() + offset); // Move to next matching weekday
    
                    const startDT = `${startDate.getFullYear()}${(startDate.getMonth() + 1).toString().padStart(2, '0')}${startDate.getDate().toString().padStart(2, '0')}T${formatTime(startTime)}`;
                    const endDT = `${startDate.getFullYear()}${(startDate.getMonth() + 1).toString().padStart(2, '0')}${startDate.getDate().toString().padStart(2, '0')}T${formatTime(endTime)}`;
    
                    // ⏳ Calculate semester end (17 weeks = 119 days from the download date)
                    const endDate = new Date(startDate);
                    endDate.setDate(startDate.getDate() + 7 * 17);
                    const untilDate = endDate.toISOString().replace(/[-:.]/g, "").slice(0, 15) + "Z";
    
                    ics += "BEGIN:VEVENT\n";
                    ics += `DTSTAMP:${dtstamp}\n`;
                    ics += `SUMMARY:${course.code ?? ""} - ${course.title}\n`;//if course.code is undefined, it won't print "undefined" in course descripton below downloaded Ics file
                    ics += `DTSTART;TZID=America/New_York:${startDT}\n`;
                    ics += `DTEND;TZID=America/New_York:${endDT}\n`;
                    ics += `RRULE:FREQ=WEEKLY;BYDAY=${dayMap[day]};UNTIL=${untilDate}\n`; // stops after 17 weeks
                    ics += `DESCRIPTION:Professor: ${course.professor}\\nCRN: ${course.CRN}\n`;
                    ics += "END:VEVENT\n";
                });
            });
        });
    
        ics += "END:VCALENDAR";
    
        const blob = new Blob([ics], { type: "text/calendar" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "schedule.ics";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="container" style={{display: 'flex', gap: '2rem', marginTop: '2rem'}}>
            {/* Scheduler on the left */}
            <div style={{flex: 2}}>
                <div style={{marginBottom: '1rem'}}>
                    <button onClick={handlePrev} disabled={currentScheduleIndex === 1}>⬅️ Prev</button>
                    <span style={{margin: '0 1rem'}}>Schedule {currentScheduleIndex}</span>
                    <button onClick={handleNext} disabled={currentScheduleIndex === scheduleKeys.length}>Next ➡️
                    </button>
                </div>
                <div
                    ref={schedulerContainerRef}
                    style={{height: "680px", border: "1px solid #ccc", borderRadius: "8px"}}
                ></div>
                
            {/* New buttons added to allow users to download their schedule as .pdf/.jpg */}
            {Object.keys(schedule).length > 0 && (
                <div style={{ marginTop: "1rem" }}>
                    <button onClick={() => handleDownload("pdf")}>Download as PDF</button> {/* Exports as PDF */}
                    <button onClick={() => handleDownload("jpg")}>Download as JPG</button> {/* Exports as image */}
                    <button onClick={handleSaveICS}>Download as ICS</button> {/* New ICS button */}                
                </div>
            )}
                

            </div>

            {/* Schedule list on the right */}
            <div style={{flex: 1}}>
                {/* /* {schedule[currentScheduleIndex] ? (
                    <div className="p-4 border rounded-lg shadow-md">
                        {Object.entries(schedule[currentScheduleIndex]).map(([courseCode, course]) => (
                            <div key={course.CRN} style={{ marginBottom: '1rem' }}>
                                <h4>{courseCode} - {course.title}</h4>
                                <p><strong>Professor:</strong> {course.professor}</p>
                                <p><strong>CRN:</strong> {course.CRN}</p>
                                <p><strong>Credits:</strong> {course.creditHours}</p>
                                <div>
                                    {course.meetingTimes.map((mt, idx) => (
                                        <p key={idx}>
                                            {mt.days.join(', ')} | {mt.start} - {mt.end} ({mt.type})
                                        </p>
                                    ))}
                                </div>
                                <hr/>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-500">No schedule selected.</p>
                )} */}
                {isLoading ? (
                    <p className="text-gray-500">⏳ Generating your schedule...</p>
                ) : scheduleKeys.length === 0 ? (
                    <p className="text-red-500">⚠️ No valid schedule could be generated. Try changing your selected
                        courses.</p>
                ) : !schedule[currentScheduleIndex] ? (
                    <p className="text-gray-500">No schedule selected.</p>
                ) : (
                    <div className="p-4 border rounded-lg shadow-md">
                        {Object.entries(schedule[currentScheduleIndex]).map(([courseCode, course]) => (
                            <div key={course.CRN} style={{marginBottom: '1rem'}}>
                                <h4>{courseCode} - {course.title}</h4>
                                <p>
                                    <strong>Professor:</strong>{" "}
                                    <a
                                        href={`https://www.ratemyprofessors.com/search/professors/999?q=${encodeURIComponent(course.professor)}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        style={{color: "#2563eb", textDecoration: "underline"}}
                                    >
                                        {course.professor}
                                    </a>
                                </p>
                                <p><strong>CRN:</strong> {course.CRN}</p>
                                <p><strong>Credits:</strong> {course.creditHours}</p>
                                <div>
                                    {course.meetingTimes.every(mt => !mt.start || !mt.end) ? (
                                        <p><i>Asynchronous course</i></p>
                                    ) : (
                                        course.meetingTimes.map((mt, idx) => (
                                            <p key={idx}>
                                                {mt.days.join(', ')} | {mt.start} - {mt.end} ({mt.type})
                                            </p>
                                        ))
                                    )}

                                </div>
                                <hr/>
                            </div>
                        ))}
                    </div>
                )}

            </div>
        </div>
    );
}

export default GeneratedSchedules;