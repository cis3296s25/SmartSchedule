from itertools import product


def time_to_int(hour: str, minute: str, ampm: str) -> int:
    """Convert time to 24-hour integer format (e.g. 8:30AM → 830, 1:00PM → 1300)"""
    hour = int(hour)
    minute = int(minute)
    if ampm == "PM" and hour != 12:
        hour += 12
    elif ampm == "AM" and hour == 12:
        hour = 0
    return hour * 100 + int(minute)


def restriction_conflicts(meeting, restrictions):
    """Check if a meeting conflicts with any user-defined restriction."""
    try:
        meeting_start = int(meeting["start"])
        meeting_end = int(meeting["end"])
        meeting_days = [day.lower() for day in meeting["days"]]  # Normalize to lowercase

        for restriction in restrictions:
            restriction_start = time_to_int(
                restriction["fromHour"], restriction["fromMinute"], restriction["fromAmPm"]
            )
            restriction_end = time_to_int(
                restriction["toHour"], restriction["toMinute"], restriction["toAmPm"]
            )

            restricted_days = [
                day.lower() for day, selected in restriction["days"].items() if selected
            ]

            for day in meeting_days:
                if day in restricted_days:
                    if meeting_start < restriction_end and meeting_end > restriction_start:
                        print(f"[RESTRICTION HIT] Meeting on {day}: {meeting_start}-{meeting_end} "
                              f"conflicts with restriction {restriction_start}-{restriction_end}")
                        return True
    except Exception as e:
        print(f"[ERROR] Failed to evaluate restriction: {e}")
    return False


def generateSchedules(courses, restrictions=None):
    if restrictions is None:
        restrictions = []

    all_schedules = {}
    count = 1

    # group all course sections by course code
    grouped = {}
    for course in courses:
        grouped.setdefault(course["code"], []).append(course)

    # generate all combinations of 1 section per course
    course_section_combinations = list(product(*grouped.values()))

    # test each combination for conflicts
    for combo in course_section_combinations:
        proposed_schedule = {}
        conflict = False

        for current_course in combo:
            for current_meeting in current_course["meetingTimes"]:

                # skip async classes
                if not current_meeting["start"] or not current_meeting["end"]:
                    continue

                # check for user defined restriction conflict
                if restriction_conflicts(current_meeting, restrictions):
                    conflict = True
                    break

                # check conflict with previously added courses
                for selected in proposed_schedule.values():
                    for selected_meeting in selected["meetingTimes"]:
                        overlapping_days = set(current_meeting["days"]) & set(selected_meeting["days"])
                        if overlapping_days:
                            if current_meeting["start"] < selected_meeting["end"] and current_meeting["end"] > \
                                    selected_meeting["start"]:
                                conflict = True
                                break
                    if conflict:
                        break
                if conflict:
                    break

            if not conflict:
                proposed_schedule[current_course["code"]] = {
                    "title": current_course["title"],
                    "CRN": current_course["CRN"],
                    "professor": current_course["professor"],
                    "creditHours": current_course["creditHours"],
                    "meetingTimes": current_course["meetingTimes"]
                }
            else:
                break  # skip this combo if a conflict was found

        if len(proposed_schedule) == len(grouped):  # full valid schedule
            all_schedules[count] = proposed_schedule
            count += 1

    return all_schedules
