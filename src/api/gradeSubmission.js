import { axios } from '@/utils/request'

const api = {
  gradeSubmissionList: '/grade-submission/list',
  gradeProportion: '/grade-submission/proportion'
}

export function getGradeSubmissionList (parameter) {
  return axios({
    url: api.gradeSubmissionList,
    method: 'get',
    params: parameter
  })
}

export function getGradeProportion (parameter) {
  return axios({
    url: api.gradeProportion,
    method: 'get',
    params: parameter
  })
}

export function updateGradeProportion (data) {
  return axios({
    url: api.gradeProportion,
    method: 'post',
    data: data
  })
} 