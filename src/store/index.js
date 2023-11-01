import Vue from 'vue'
import Vuex from 'vuex'

import app from './modules/app'
import user from './modules/user'
import course from './modules/course'
// default router permission control
// import permission from './modules/permission'
// dynamic router permission control (Experimental)
import permission from './modules/async-router'
import getters from './getters'
import {getAllInfo} from '@/api/base'
import moment from 'moment'
import storage from 'store'
import {getStudentSelectedCourses} from '@/api/manage'
// import axios from 'axios'

Vue.use(Vuex)

export default new Vuex.Store({
  modules: {
    app,
    user,
    permission,
    course
  },
  state: {
    loaded: true,
    isAdmin: false,
    trimester: null, // 持久化
    courseWeek: null,
    termStartDate: null,
    disabledDate: null,
    backend: null, // 持久化
    showIntroductionNotification: true,
    allClassrooms: {},
    allTeachers: {},
    allColleges: {},
    usedClassrooms: {},
    appliedClassrooms: {},
    allClassroomHash: null,
    allInfosExtra: null,
    allInfosExtraUpdateTime: null,
    selectedCourses: [],
    reservedCourses: {}, // 持久化
    currentTeacher: {},
    lastUpdateTime: null,
    studentInfo: {}
  },
  mutations: {
    LOADED (state, value) {
      state.loaded = value
    },
    ISADMIN (state, value) {
      state.isAdmin = value
    },
    TRIMESTER (state, value) {
      state.trimester = value
    },
    COURSE_WEEK (state, value) {
      state.courseWeek = value
    },
    TERM_START_DATE (state, value) {
      state.termStartDate = value
    },
    DISABLED_DATE (state, value) {
      state.disabledDate = value
    },
    BACKEND (state, value) {
      state.backend = value
    },
    IGNORE_INTRODUCTION_NOTIFICATION (state) {
      state.showIntroductionNotification = false
    },
    USED_CLASSROOMS (state, value) {
      state.usedClassrooms = value
    },
    ALL_TEACHERS (state, value) {
      state.allTeachers = value
    },
    ALL_COLLEGES (state, value) {
      state.allColleges = value
    },
    APPLIED_CLASSROOMS (state, value) {
      state.appliedClassrooms = value
    },
    ALL_INFO (state, value) {
      state.usedClassrooms = value
    },
    ALL_INFOS_EXTRA (state, value) {
      state.allInfosExtra = value
    },
    ALL_INFOS_EXTRA_UPDATE_TIME (state, value) {
      state.allInfosExtraUpdateTime = value
    },
    RESERVED_COURSES (state, value) {
      state.reservedCourses = value
    },
    SELECTED_COURSES (state, value) {
      state.selectedCourses = value
    },
    CURRENT_TEACHER (state, value) {
      state.currentTeacher = value
    },
    LAST_UPDATE_TIME (state, value) {
      state.lastUpdateTime = value
    },
    STUDENT_INFO (state, value) {
      state.studentInfo = value
    }
  },
  actions: {
    checkUpdateAllInfos: function (context) {
      console.log('checking update')
      return new Promise((resolve, reject) => {
        getAllInfo().then((response) => {
          const tasks = []
          if (response['trimester'] !== context.state.trimester) {
            context.commit('TRIMESTER', response['trimester'])
            tasks.push(storage.set('trimester', response['trimester']))
          }
          if (response['course_week'] !== context.state.courseWeek) {
            context.commit('COURSE_WEEK', response['course_week'])
            tasks.push(storage.set('courseWeek', response['course_week']))
          }
          if (response['term_start_date'] !== context.state.termStartDate) {
            context.commit('TERM_START_DATE', response['term_start_date'])
            tasks.push(storage.set('termStartDate', response['term_start_date']))
          }
          if (response['backend'] !== context.state.backend) {
            context.commit('BACKEND', response['backend'])
            tasks.push(storage.set('backend', response['backend']))
          }
          if (response['all_teachers'] !== context.state.allTeachers) {
            context.commit('ALL_TEACHERS', response['all_teachers'])
            tasks.push(storage.set('allTeachers', response['all_teachers']))
          }
          if (response['all_colleges'] !== context.state.allColleges) {
            context.commit('ALL_COLLEGES', response['all_colleges'])
            tasks.push(storage.set('allColleges', response['all_colleges']))
          }
          if (response['is_admin'] !== context.state.isAdmin) {
            context.commit('ISADMIN', response['is_admin'])
            tasks.push(storage.set('isAdmin', response['is_admin']))
          }
          context.commit('LAST_UPDATE_TIME', moment.now())
          Promise.all(tasks).then(() => {
            resolve('1')
          })
        }).catch(() => {
          // eslint-disable-next-line prefer-promise-reject-errors
          reject()
        })
      })
    },
    reserveCourse (context, data) {
      // 添加待选教室
      const tasks = []
      return new Promise((resolve) => {
        const selectedCopy = JSON.parse(JSON.stringify(context.state.selectedCourses))
        const reservedCopy = JSON.parse(JSON.stringify(context.state.reservedCourses))
        if (!(selectedCopy && selectedCopy.every(item => item.课程名称 !== data['course_name']))) {
          Vue.prototype.$message.error('已选择本课程的平行班')
        } else if (Object.keys(reservedCopy).length + selectedCopy.filter(item => item.状态 === '待教务处审核').length >= 2) {
          Vue.prototype.$message.error('每学期增选课程门数上限为2门')
        } else {
          selectedCopy.push(
            {
              '课程名称': data['course_name'],
              '班级名称': data['class_name'],
              '状态': '待提交'
            })
          const courseId = data['course_id']
          if (!reservedCopy.hasOwnProperty(courseId)) {
            reservedCopy[courseId] = data
          }
        }
        context.commit('RESERVED_COURSES', reservedCopy)
        context.commit('SELECTED_COURSES', selectedCopy)
        tasks.push(storage.set('reservedCourses', reservedCopy))
        tasks.push(storage.set('selectedCourses', selectedCopy))
        Promise.all(tasks).then(() => {
          resolve()
        })
      })
    },
    unreserveCourse (context, data) {
      console.log(data)
      const courseId = data['course_id']
      const tasks = []
      return new Promise((resolve) => {
        let selectedCopy = JSON.parse(JSON.stringify(context.state.selectedCourses))
        const reservedCopy = JSON.parse(JSON.stringify(context.state.reservedCourses))
        selectedCopy = selectedCopy.filter(item => item.课程名称 !== data['course_name'])

        if (reservedCopy.hasOwnProperty(courseId)) {
          delete reservedCopy[courseId]
        }
        context.commit('RESERVED_COURSES', reservedCopy)
        context.commit('SELECTED_COURSES', selectedCopy)
        tasks.push(storage.set('reservedCourses', reservedCopy))
        tasks.push(storage.set('selectedCourses', selectedCopy))
        Promise.all(tasks).then(() => {
          resolve()
        })
      })
    },
    clearSelectedAndReservedCourse (context) {
      const tasks = []
      return new Promise((resolve) => {
        const selectedCopy = {}
        const reservedCopy = {}

        context.commit('RESERVED_COURSES', reservedCopy)
        context.commit('SELECTED_COURSES', selectedCopy)
        tasks.push(storage.set('reservedCourses', reservedCopy))
        tasks.push(storage.set('selectedCourses', selectedCopy))
        Promise.all(tasks).then(() => {
          resolve()
        })
      })
    },
    getSelectedCourses (context, data) {
      return new Promise((resolve) => {
        const params = {
        'stu_id': data
        }
        getStudentSelectedCourses(params).then(res => {
          const tasks = []
          if (res.hasOwnProperty('stu_info') && res['stu_info'] !== context.state.studentInfo) {
            context.commit('STUDENT_INFO', res['stu_info'])
            tasks.push(storage.set('studentInfo', res['stu_info']))
          }
          if (res.hasOwnProperty('selected') && res['selected'] !== context.state.selectedCourses) {
            context.commit('SELECTED_COURSES', res['selected'])
            tasks.push(storage.set('selectedCourses', res['selected']))
          }
          Promise.all(tasks).then(() => {
            resolve(res)
          })
        }).catch((err) => {
        }).finally(() => {
      })
      })
    }
  },
  getters
})
