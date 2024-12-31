import request from '@/utils/request'

// 获取成绩提交列表
export function getGradeSubmissionList(params) {
  return request({
    url: '/grade-submission/list',
    method: 'get',
    params
  })
}

// 更新成绩比例
export function updateGradeProportion(data) {
  return request({
    url: '/api/grade/proportion/update',
    method: 'post',
    data
  })
}

// 获取用户信息
export function getUserInfo() {
  return request({
    url: '/api/user/info',
    method: 'get'
  })
}

// 获取课程列表
export function getCourseList(params) {
  return request({
    url: '/api/course/list',
    method: 'get',
    params
  })
}

// 提交成绩
export function submitGrades(data) {
  return request({
    url: '/api/grades/submit',
    method: 'post',
    data
  })
}

// 获取班级详情
export function getClassDetails(classId) {
  return request({
    url: `/api/class/${classId}/details`,
    method: 'get'
  })
} 