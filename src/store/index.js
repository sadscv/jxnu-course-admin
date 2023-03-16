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
import { getAllInfo } from '@/api/base'
import moment from 'moment'
import storage from 'store'
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
    reservedClassroom: {}, // 持久化
    currentTeacher: {},
    lastUpdateTime: null
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
    RESERVED_CLASSROOM (state, value) {
      state.reservedClassroom = value
    },
    CURRENT_TEACHER (state, value) {
      state.currentTeacher = value
    },
    LAST_UPDATE_TIME (state, value) {
      state.lastUpdateTime = value
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
            console.log('##', response['course_week'])
            context.commit('COURSE_WEEK', response['course_week'])
            tasks.push(storage.set('courseWeek', response['course_week']))
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
    }
  },
  getters
})
