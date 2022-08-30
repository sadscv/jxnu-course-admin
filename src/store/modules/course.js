import storage from 'store'
import { getAllCourseInfo } from '@/api/base'

const course = {
  state: {
    allCourses: []
  },

  mutations: {
    ALL_COURSES (state, value) {
      state.allCourses = value
    }
  },

  actions: {
    updateAllCoursesInfo: function (context) {
      return new Promise((resolve, reject) => {
        getAllCourseInfo().then((response) => {
          context.commit('ALL_COURSES', response)
          const task = []
          task.push(storage.set('allCourses', response))
          Promise.all(task).then(() => {
            resolve('1')
          }).catch(() => {
          // eslint-disable-next-line prefer-promise-reject-errors
            reject()
        })
      })
    })
    }
  }
}

export default course
