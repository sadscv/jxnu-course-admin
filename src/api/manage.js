import request from '@/utils/request'

const api = {
  user: '/user',
  role: '/menu/get-menu-list',
  // role: '/role',
  service: '/service',
  permission: '/permission',
  permissionNoPager: '/permission/no-pager',
  selectedCourses: '/selected_courses',
  reserveCourse: '/reserve_course',
  orgTree: '/org/tree',
  courseStatus: 'course_status',
  weekStatus: '/week_status',
  adjustCourse: '/adjust_course',
  updateAdjustment: '/update_adjustment'
}

export default api

export function getUserList (parameter) {
  return request({
    url: api.user,
    method: 'get',
    params: parameter
  })
}

export function getRoleList (parameter) {
  return request({
    url: api.role,
    method: 'get',
    params: parameter
  })
}

export function getServiceList (parameter) {
  return request({
    url: api.service,
    method: 'get',
    params: parameter
  })
}

export function getPermissions (parameter) {
  return request({
    url: api.permissionNoPager,
    method: 'get',
    params: parameter
  })
}

export function getOrgTree (parameter) {
  return request({
    url: api.orgTree,
    method: 'get',
    params: parameter
  })
}

// id == 0 add     post
// id != 0 update  put
export function saveService (parameter) {
  return request({
    url: api.service,
    method: parameter.id === 0 ? 'post' : 'put',
    data: parameter
  })
}

export function saveSub (sub) {
  return request({
    url: '/sub',
    method: sub.id === 0 ? 'post' : 'put',
    data: sub
  })
}

export function getCourseStatus (parameter) {
  return request({
    url: api.courseStatus,
    method: 'get',
    params: parameter
  })
}

export function saveWeekStatus (parameter) {
  return request({
    url: api.weekStatus,
    method: 'post',
    headers: {
      'Content-Type': 'application/json;charset=UTF-8'
    },
    data: parameter
  })
}
export function saveCourseStatus (parameter) {
  return request({
    url: api.courseStatus,
    method: 'post',
    headers: {
      'Content-Type': 'application/json;charset=UTF-8'
    },
    data: parameter
  })
}

export function commitCourseAdjustment (parameter) {
  return request({
    url: api.adjustCourse,
    method: 'post',
    headers: {
      'Content-Type': 'application/json;charset=UTF-8'
    },
    data: parameter
  })
}

export function updateAdjustmentInfo (parameter) {
  return request({
    url: api.updateAdjustment,
    method: 'post',
    headers: {
      'Content-Type': 'application/json;charset=UTF-8'
    },
    data: parameter
  })
}
export function getStudentSelectedCourses (parameter) {
  return request({
    url: api.selectedCourses,
    method: 'post',
    headers: {
      'Content-Type': 'application/json;charset=UTF-8'
    },
    data: parameter
  })
}

export function reserveCourse (parameter) {
  return request({
    url: api.reserveCourse,
    method: 'post',
    headers: {
      'Content-Type': 'application/json;charset=UTF-8'
    },
    data: parameter
  })
}
