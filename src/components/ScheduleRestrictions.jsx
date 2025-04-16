import React, { useState } from 'react';

function ScheduleRestrictions({restrictions, setRestrictions}) {
    const [showSection, setShowSection] = useState(false);

    const hourOptions = Array.from({ length: 12 }, (_, i) => (i + 1).toString());
    const minuteOptions = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'));
    const ampmOptions = ["AM", "PM"];
    const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

    const addRestriction = () => {
        const newRestriction = {
            fromHour: "",
            fromMinute: "",
            fromAmPm: "",
            toHour: "",
            toMinute: "",
            toAmPm: "",
            isEntered: false,
            days: {
                Sunday: false,
                Monday: false,
                Tuesday: false,
                Wednesday: false,
                Thursday: false,
                Friday: false,
                Saturday: false
            }
        };
        setRestrictions((prev) => [...prev, newRestriction]);
    };

    const handleChange = (index, field, value) => {
        const updated = [...restrictions];
        updated[index][field] = value;
        setRestrictions(updated);
    };

    const toggleDay = (index, day) => {
        const updated = [...restrictions];
        updated[index].days[day] = !updated[index].days[day];
        setRestrictions(updated);
    };

    const isRestrictionComplete = (restriction) => {
        const timeFilled = restriction.fromHour && restriction.fromMinute && restriction.fromAmPm &&
            restriction.toHour && restriction.toMinute && restriction.toAmPm;
        const anyDaySelected = Object.values(restriction.days).some(Boolean);
        return timeFilled && anyDaySelected;
    };

    const handleEnter = (index) => {
        const updated = [...restrictions];
        updated[index].isEntered = true;
        setRestrictions(updated);
    };

    const deleteRestriction = (index) => {
        const confirmDelete = window.confirm("Are you sure you want to delete this restriction?");
        if (confirmDelete) {
            const updated = [...restrictions];
            updated.splice(index, 1);
            setRestrictions(updated);
        }
    };

    const canAddAnother = restrictions.length === 0 || (restrictions[restrictions.length - 1]?.isEntered);

    return (
        <div>
            <h3>Schedule Restrictions</h3>

            {!showSection && (
                <button onClick={() => { setShowSection(true); addRestriction(); }}>
                    Add Restriction
                </button>
            )}

            {showSection && (
                <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {restrictions.map((restriction, index) => (
                        <div
                            key={index}
                            style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                border: '1px solid #ccc',
                                padding: '1rem',
                                borderRadius: '8px',
                                gap: '1rem'
                            }}
                        >
                            {/* Left section with form controls */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                <strong>Restriction {index + 1}</strong>

                                {/* Time selection row */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                                    {/* FROM */}
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <span>From</span>
                                        <select value={restriction.fromHour} onChange={(e) => handleChange(index, "fromHour", e.target.value)} disabled={restriction.isEntered}>
                                            <option value="">Hour</option>
                                            {hourOptions.map(h => <option key={h} value={h}>{h}</option>)}
                                        </select>
                                        <span>:</span>
                                        <select value={restriction.fromMinute} onChange={(e) => handleChange(index, "fromMinute", e.target.value)} disabled={restriction.isEntered}>
                                            <option value="">Min</option>
                                            {minuteOptions.map(m => <option key={m} value={m}>{m}</option>)}
                                        </select>
                                        <select value={restriction.fromAmPm} onChange={(e) => handleChange(index, "fromAmPm", e.target.value)} disabled={restriction.isEntered}>
                                            <option value="">AM/PM</option>
                                            {ampmOptions.map(ap => <option key={ap} value={ap}>{ap}</option>)}
                                        </select>
                                    </div>

                                    {/* TO */}
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <span>To</span>
                                        <select value={restriction.toHour} onChange={(e) => handleChange(index, "toHour", e.target.value)} disabled={restriction.isEntered}>
                                            <option value="">Hour</option>
                                            {hourOptions.map(h => <option key={h} value={h}>{h}</option>)}
                                        </select>
                                        <span>:</span>
                                        <select value={restriction.toMinute} onChange={(e) => handleChange(index, "toMinute", e.target.value)} disabled={restriction.isEntered}>
                                            <option value="">Min</option>
                                            {minuteOptions.map(m => <option key={m} value={m}>{m}</option>)}
                                        </select>
                                        <select value={restriction.toAmPm} onChange={(e) => handleChange(index, "toAmPm", e.target.value)} disabled={restriction.isEntered}>
                                            <option value="">AM/PM</option>
                                            {ampmOptions.map(ap => <option key={ap} value={ap}>{ap}</option>)}
                                        </select>
                                    </div>
                                </div>

                                {/* Day checkboxes */}
                                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                                    {daysOfWeek.map((day) => (
                                        <label key={day}>
                                            <input
                                                type="checkbox"
                                                checked={restriction.days[day]}
                                                onChange={() => toggleDay(index, day)}
                                                disabled={restriction.isEntered}
                                            />
                                            {day.slice(0, 3)}
                                        </label>
                                    ))}
                                </div>

                                {/* ENTER button */}
                                {!restriction.isEntered && isRestrictionComplete(restriction) && (
                                    <button onClick={() => handleEnter(index)}>Enter</button>
                                )}
                            </div>

                            {/* DELETE button */}
                            {restriction.isEntered && (
                                <div style={{ display: 'flex' }}>
                                    <button
                                        onClick={() => deleteRestriction(index)}
                                        style={{
                                            backgroundColor: 'white',
                                            color: '#60101d',
                                            padding: '0.5rem 1rem',
                                            borderRadius: '10px',
                                            border: 'none',
                                            cursor: 'pointer',
                                            marginTop: '1.0rem' //
                                        }}
                                    >
                                        Delete
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}

                    {/* Add another restriction */}
                    {canAddAnother && (
                        <button onClick={addRestriction}>Add Another Restriction</button>
                    )}
                </div>
            )}
        </div>
    );
}

export default ScheduleRestrictions;
