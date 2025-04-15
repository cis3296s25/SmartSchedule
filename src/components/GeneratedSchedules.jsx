/* global scheduler */
import { useEffect, useState } from 'react';

function GeneratedSchedules({ schedule, schedulerContainerRef, isLoading }) {
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

    return (
        <div className="container" style={{ display: 'flex', gap: '2rem', marginTop: '2rem' }}>
            {/* Scheduler on the left */}
            <div style={{ flex: 2 }}>
                <div style={{ marginBottom: '1rem' }}>
                    <button onClick={handlePrev} disabled={currentScheduleIndex === 1}>⬅️ Prev</button>
                    <span style={{ margin: '0 1rem' }}>Schedule {currentScheduleIndex}</span>
                    <button onClick={handleNext} disabled={currentScheduleIndex === scheduleKeys.length}>Next ➡️</button>
                </div>
                <div
                    ref={schedulerContainerRef}
                    style={{ height: "680px", border: "1px solid #ccc", borderRadius: "8px" }}
                ></div>
            </div>

            {/* Schedule list on the right */}
            <div style={{ flex: 1 }}>
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
                )} */ }
                {isLoading ? (
                    <p className="text-gray-500">⏳ Generating your schedule...</p>
                    ) : scheduleKeys.length === 0 ? (
                    <p className="text-red-500">⚠️ No valid schedule could be generated. Try changing your selected courses.</p>
                    ) : !schedule[currentScheduleIndex] ? (
                    <p className="text-gray-500">No schedule selected.</p>
                    ) : (
                    <div className="p-4 border rounded-lg shadow-md">
                        {Object.entries(schedule[currentScheduleIndex]).map(([courseCode, course]) => (
                        <div key={course.CRN} style={{ marginBottom: '1rem' }}>
                            <h4>{courseCode} - {course.title}</h4>
                            <p>
                                <strong>Professor:</strong>{" "}
                                <a
                                    href={`https://www.ratemyprofessors.com/search/professors/999?q=${encodeURIComponent(course.professor)}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{ color: "#2563eb", textDecoration: "underline" }}
                                >
                                    {course.professor}
                                </a>
                            </p>
                            <p><strong>CRN:</strong> {course.CRN}</p>
                            <p><strong>Credits:</strong> {course.creditHours}</p>
                            <div>
                            {course.meetingTimes.map((mt, idx) => (
                                <p key={idx}>
                                {mt.days.join(', ')} | {mt.start} - {mt.end} ({mt.type})
                                </p>
                            ))}
                            </div>
                            <hr />
                        </div>
                        ))}
                    </div>
                    )}
                <button
                onClick={() =>
                window.open(
                    "https://prd-xereg.temple.edu/StudentRegistrationSsb/ssb/registration",
                    "_blank"
                )
                }
            >
                🏫 Go to Temple Registration
            </button>
            </div>
            
        </div>
    );
}

export default GeneratedSchedules;