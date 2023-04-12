import registerPromiseWorker from 'promise-worker/register'

const periodsCache = {}
function getPeriods (str) {
  if (periodsCache.hasOwnProperty(str)) {
    return periodsCache[str]
  } else {
    const pattern = /([一二三四五六七])(\d+)(?:-(\d+))?/g
    const result = []
    let execResult = pattern.exec(str)
    while (execResult !== null) {
      const from = parseInt(execResult[2]); const to = execResult[3] != null ? parseInt(execResult[3]) : from
      if (from >= 1 && from <= 13 && to >= 1 && to <= 13 && from <= to) {
        for (let i = from; i <= to; i++) {
          // e.g. [row(2),column(3),is_start(true),span(2)]
          result.push([i - 1, ['一', '二', '三', '四', '五', '六', '七'].indexOf(execResult[1]), i === from, to - from + 1])
        }
      }
      execResult = pattern.exec(str)
    }
    periodsCache[str] = result
    return periodsCache[str]
  }
}

function concatRegExp (parts) {
  parts.forEach((part, index) => {
    parts[index] = part.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  })
  return new RegExp(parts.join('.*'), 'i')
}

registerPromiseWorker(function (message) {
  const isSelected = (data) => {
    return data['course_id'] in message.reservedCourses &&
      data['class_id'] === message.reservedCourses[data['course_id']].class_id
  }
  // const isReserved = (data) => {
  //   if (message.reservedClasses.hasOwnProperty(data['course_id'])) {
  //     if (message.reservedClasses[data['course_id']].classes.hasOwnProperty(data['class_id'])) {
  //       return true
  //     }
  //   }
  //   return false
  // }
  // const isSelected = (data) => {
  //   if (message.selectedClasses.hasOwnProperty(data['course_id'])) {
  //     if (message.selectedClasses[data['course_id']].teacherId === data['teacher_id']) {
  //       return true
  //     }
  //   }
  //   return false
  // }
  // const getClassName = (classIds) => {
  //   const class_dict = {}
  //   for (const key in message.classList) {
  //     if (message.classList.hasOwnProperty(key)) {
  //       message.classList[key].forEach((class_pair) => {
  //         class_dict[class_pair[1]] = class_pair[0]
  //       })
  //     }
  //   }
  //   const result = []
  //   classIds.forEach((classId) => {
  //     if (class_dict.hasOwnProperty(classId)) {
  //       result.push(class_dict[classId])
  //     }
  //   })
  //   if (result) {
  //     return result
  //   } else {
  //    return classIds
  //   }
  // }
  const isNumberLower = (data, condition) => {
    // const conditionNumber = parseInt(condition)
    // if (Number.isInteger(conditionNumber) && conditionNumber > 0) {
    //   if (message.allClassesExtra.hasOwnProperty(`${data['course_id']}-${data['class_id']}`)) {
    //     const capacity = parseInt(message.allClassesExtra[`${data['course_id']}-${data['class_id']}`].capacity)
    //     const number = parseInt(message.allClassesExtra[`${data['course_id']}-${data['class_id']}`].number)
    //     if (Number.isInteger(capacity) && Number.isInteger(number)) {
    //       return capacity <= conditionNumber
    //     }
    //   }
    // }
    return false
  }
  // const isNumberExceeded = (data, condition) => {
  //   let conditionNumber = parseInt(condition);
  //   if (Number.isInteger(conditionNumber) && conditionNumber > 0) {
  //     if (message.allClassesExtra.hasOwnProperty(`${data['course_id']}-${data['teacher_id']}`)) {
  //       let capacity = parseInt(message.allClassesExtra[`${data['course_id']}-${data['teacher_id']}`].capacity);
  //       let number = parseInt(message.allClassesExtra[`${data['course_id']}-${data['teacher_id']}`].number);
  //       if (Number.isInteger(capacity) && Number.isInteger(number)) {
  //         return capacity - number < conditionNumber;
  //       }
  //     }
  //   }
  //   return false;
  // };
  // const getConflicts = (courseId, classTime) => {
  //   const courseConflicts = {}
  //   getPeriods(classTime).forEach((period) => {
  //     const targetCell = message.scheduleTableRows[period[0]][period[1]]
  //     if (targetCell !== null && targetCell.courseId !== courseId) {
  //       courseConflicts[targetCell.courseId] = true
  //     }
  //   })
  //   return courseConflicts
  // }
  const rows = []
  const conditionsRegExp = {}
  for (const condition in message.conditions.search) {
    if (message.conditions.search.hasOwnProperty(condition)) {
      conditionsRegExp[condition] = concatRegExp(message.conditions.search[condition].split(/\s+/))
    }
  }
  message.allClasses.forEach((row) => {
    if (isNumberLower(row, message.conditions.number)) {
      return
    }
    for (const condition in conditionsRegExp) {
      if (conditionsRegExp.hasOwnProperty(condition)) {
        if (!conditionsRegExp[condition].test(row[condition])) {
          return
        }
      }
    }
    // 仅一级属性复制,慎用 :sadscv注
    const newRow = Object.assign({}, row)
    newRow['course'] = {
      id: newRow['course_id'],
      name: newRow['course_name'],
      credit: newRow['credit']
    }
    newRow['teacher'] = {
      id: newRow['teacher_id'],
      name: newRow['teacher_name']
    }
    newRow['venue'] = {
      key: `${newRow['course_id']}-${newRow['class_id']}`,
      campus: newRow['campus']
    }
    newRow['classroom'] = {
      key: `${newRow['class_key']}`,
      classroom_id: newRow['classrooms']
    }
    newRow['number'] = {
      key: `${newRow['course_id']}-${newRow['class_id']}`
    }
    newRow['classes'] = {
      id: newRow['class_id'],
      name: newRow['class_name'],
      originClass: '课程名',
      // originClass: getClassName(newRow['origin_class_id']),
      originClassId: newRow['origin_class_id']
    }
    newRow['class_time_info'] = {
      row: row,
      key: `${newRow['course_id']}-${newRow['class_id']}`,
      isSelected: true,
      canPreview: getPeriods(newRow['class_time']).length > 0,
      conflicts: false
    }
    newRow['action'] = {
      row: row,
      isReserved: true,
      // isReserved: isReserved(row),
      isSelected: isSelected(row),
      conflicts: newRow['class_time_info'].conflicts
    }
    newRow['key'] = `${newRow['course_id']}-${newRow['class_id']}`
    if ((!message.conditions.filterConflicts || Object.keys(newRow['class_time_info'].conflicts).length === 0) &&
      (message.conditions.displayOption !== 1 || !newRow['action'].isReserved) &&
      (message.conditions.displayOption !== 2 || newRow['action'].isReserved)) {
      rows.push(newRow)
    }
  })
  return rows
})
