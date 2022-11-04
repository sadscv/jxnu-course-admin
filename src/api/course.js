import request from '@/utils/request'

const courseApi = {
  AdjustmentList: '/course_adjustment/list'
}

export default courseApi

export function getAdjustmentList (parameter) {
  return request({
    url: courseApi.AdjustmentList,
    method: 'get',
    headers: {
      'Content-Type': 'application/json;charset=UTF-8'
    }
  })
}
