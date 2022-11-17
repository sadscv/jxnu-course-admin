import PromiseWorker from 'promise-worker'

export const LookupPanelMixin = {
  data () {
    return {
      promiseWorker: null,
      rows: [],
      storageBusy: false,
      timer: null,
      tableLoading: false
    }
  },
  mounted () {
    console.log('mount')
    this.promiseWorker = new PromiseWorker(new Worker('../workers/filter.js', { type: 'module' }))
    setTimeout(() => {
      this.filter(this.$refs.conditions.conditions).then((rows) => {
        this.rows = rows
        this.tableLoading = false
      })
      }, 1)
  },
  watch: {
    '$store.state.allClasses' () {
      this.countdown(0, false) // 避免重复执行筛选
    },
    '$store.state.selectedClasses' () {
      this.countdown(0, false) // 避免重复执行筛选
    },
    '$store.state.reservedClasses' () {
      this.countdown(0, false) // 避免重复执行筛选
    }
  },
  beforeDestroy () {
    if (this.timer !== null) {
      clearTimeout(this.timer)
    }
  },
  methods: {
    countdown (delay, toPageOne) {
      this.storageBusy = true
      if (this.timer !== null) {
        clearTimeout(this.timer)
      }
      this.timer = setTimeout(() => {
        this.filter(this.$refs.conditions.conditions).then((rows) => {
          this.rows = rows
          this.storageBusy = false
          if (toPageOne) {
            if (this.$refs.hasOwnProperty('table')) {
              this.$refs.table.$children[0].sPagination.current = 1
            } else if (this.$refs.hasOwnProperty('list')) {
              this.$refs.list.paginationCurrent = 1
            }
          }
        })
      }, delay)
    },
    filter (conditions) {
      const state = JSON.parse(JSON.stringify(this.$store.state))
      return this.promiseWorker.postMessage({
        allClasses: this.$store.state.course.allCourses,
        reservedClasses: this.$store.state.reservedClasses,
        selectedClasses: this.$store.state.selectedClasses,
        scheduleTableRows: this.$store.getters.scheduleTableRows,
        allClassesExtra: this.$store.state.allClassesExtra,
        classList: this.$store.state.classList,
        conditions
      })
    },
    reserveClass (data, select, conflicts) {
      if (select && Object.keys(conflicts).length > 0) {
        this.storageBusy = true
        this.$store.dispatch('reserveClass', data).then(() => {
          this.showConflictsSolvingDialog(data, conflicts)
        })
      } else {
        this.storageBusy = true
        this.$store.dispatch(select ? 'reserveClassThenSelect' : 'reserveClass', data)
      }
    },
    updateCourseInfo (data, select) {
    },
    LoadAllCourses: function () {
      // const hide = this.$message.loading('正在检查数据更新...', 0);
      this.tableLoading = true
      this.$store.dispatch('updateAllCoursesInfo').then((data) => {
        this.tableLoading = false
        if (data != null) {
        } else {
          this.$message.error('未获取到基础数据，请刷新页面重试！', 30)
        }
      }).catch(() => {
        this.$message.error('更新课程aaa数据时出错，请刷新页面重试！', 30)
        this.$store.commit('LOADED', true)
      })
    }
  }
}

export const LookupConditionsMixin = {
  data () {
    return {
      conditions: {
        search: {
          'college': '',
          'course_id': '',
          'course_name': '',
          'class_name': '',
          'credit': '',
          'teacher_id': '',
          'teacher_name': '',
          'class_time': '',
          'campus': ''
        },
        filterConflicts: false,
        displayOption: 0,
        number: ''
      },
    }
  },
  watch: {
    conditions: {
      handler () {
        if (this.conditions.number === '0' || this.conditions.number === 0 || parseInt(this.conditions.number) === 0) {
          this.conditions.number = ''
        }
        this.$emit('filter')
      },
      deep: true
    },

  }
}
