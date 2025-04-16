from itertools import product

def generateSchedules(courses):
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
                if not current_meeting["start"] or not current_meeting["end"]:
                    continue
                for selected in proposed_schedule.values():
                    for selected_meeting in selected["meetingTimes"]:
                        overlapping_days = set(current_meeting["days"]) & set(selected_meeting["days"])
                        if overlapping_days:
                            if current_meeting["start"] < selected_meeting["end"] and current_meeting["end"] > selected_meeting["start"]:
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

