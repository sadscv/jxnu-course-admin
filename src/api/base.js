
import request from '@/utils/request'

const baseApi = {
  college: '/base/college',
  info: '/base/info'
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
