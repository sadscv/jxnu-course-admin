import request from '@/utils/request'

const baseApi = {
  college: '/base/college',
  info: '/base/info',
  AllCourse: '/all_courses'
}

export default baseApi

export function getCollegeList () {
  return request({
    url: baseApi.college,
    method: 'get',
    headers: {
      'Content-Type': 'application/json;charset=UTF-8'
    }
  })
}

export function getAllInfo () {
  return request({
    url: baseApi.info,
    method: 'get',
    headers: {
      'Content-Type': 'application/json;charset=UTF-8'
    }
  })
}

export function getAllCourseInfo () {
  return request({
    url: baseApi.AllCourse,
    method: 'get',
    headers: {
      'Content-Type': 'application/json;charset=UTF-8'
    }
  })
}
