<template>
  <div ref="wrapper">
    <a-button
      type="primary"
      :loading="loading"
      @click="showModal"
    >
      变更申请
    </a-button>
    <a-modal
      :visible="visible"
      :confirm-loading="loading"
      title="提交报备"
      :okText="submitButtonText"
      width="1000px"
      layout="inline"
      @cancel="() => { handleCancel() }"
      @ok="() => { handlePush() }"
    >
      <a-form class="apply-info-wrapper ant-form-item" :label-col="labelCol" layout="inline">
        <a-form-item label="管理单位" layout="horizontal"> <a>{{ courseInfo.college }}</a> </a-form-item>
        <a-form-item label="课程名称" layout="horizontal"> <a>{{ courseInfo.course_name }}</a> </a-form-item>
        <a-form-item label="班级名称" layout="inline"> <a>{{ courseInfo.class_name }}</a> </a-form-item>
        <a-form-item label="任课教师" layout="inline"> <a>{{ courseInfo.teacher_name }}</a> </a-form-item>
        <a-form-item label="开课周次">
          <div>
            <a-checkable-tag type="danger" v-for="check in weekUsageList" :key="check.key" v-model:checked="check.value">{{ check.week }}</a-checkable-tag>
          </div>
        </a-form-item>

        <a-form-item label="">
          <a-table
            :data-source="columnData"
            size="small"
            :fixed="true"
            :pagination="{ pageSize: this.pageSize}"
            :showHeader="false"
          >
            <a-table-column title="周次" data-index="key">
              <template v-slot="key">
                第{{ key }}周
              </template>
            </a-table-column>
            <a-table-column title="开课" data-index="courseWeek">
              <template v-slot="courseWeek">
                <a-switch v-model:checked="weekUsageList[courseWeek].value" checked-children="开课" un-checked-children="不开"/>
              </template>
            </a-table-column>
            <a-table-column data-index="courseInfo">
              <template v-slot="courseInfo">
                <courseTimeTable
                  @syncCourseTime="setCourseTime"
                  @pushWeekChange="saveWeekChange"
                  @onAdjustCourse="setCourseAdjustInfo"
                  :weekDetail="getWeekStatus(courseInfo.key)"
                  :showHeader="isShowHeader(courseInfo.key)"
                  :loading="getWeekLoadingStatus(courseInfo.key)"
                  :enable="weekUsageList[parseInt(courseInfo.key) - 1].value"
                />
              </template>
            </a-table-column>
          </a-table>
        </a-form-item>
        <a-form-item>
          <template v-if="displayAdjustButton()">
            <span style="margin-left: 8px">
              <b>调停课时段：</b>
              {{ this.adjustedString }}
            </span>
          </template>
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script>

import courseTimeTable from '@/views/coursemanage/SubmitPanel/courseTimeTable'
import { getCourseStatus, saveCourseStatus, saveWeekStatus, commitCourseAdjustment } from '@/api/manage'
import moment from 'moment'

export default {
  name: 'PopupPanel',
  components: {
      courseTimeTable
    },
  data () {
    return {
      loading: false,
      visible: false,
      teacher_id: null,
      college_name: null,
      columnData: null,
      submitButtonText: '提交变更',
      pageSize: 10,
      weekUsageList: [],
      adjustedCourse: {},
      adjustedString: '',
      labelCol: {
        // style: { width: '150px' },
        // xs: { span: 8 },
        // sm: { span: 4 }
        },
      wrapperCol: {
        xs: { span: 12 },
        sm: { span: 16 }
      }
    }
  },
  created () {
    this.initWeekUsageList()
  },
  props: {
    selectedDate: {
      type: Array
    },
    courseInfo: {
    },
    defaultWeek: {
    }
  },
  watch: {
  },
  computed: {
  },
  methods: {
    showModal () {
      const _this = this
      this.loading = true
      const params = {
        'course_id': _this.courseInfo.course_id,
        'class_id': _this.courseInfo.class_id
      }
      getCourseStatus(params).then(res => {
        this.setCourseInfo(res.result)
      }).finally(() => {
        _this.loading = false
        _this.visible = true
      })
    },
    handleCancel () {
      this.visible = false
    },
    handlePush () {
      if (this.displayAdjustButton()) {
        this.pushAdjustedCourse()
      }
        this.weekUsageList.forEach((usage, index) => {
          this.columnData[index].enable = usage.value
        })

      const pushList = []
      this.columnData.forEach((week) => {
        const status = week.weekStatus
        Object.keys(status).forEach((key) => {
          status[key].enable = week.enable
          pushList.push(status[key])
        })
      })
      const _this = this
      this.loading = true
      let msg = null
      saveCourseStatus(pushList).then(res => {
        msg = res
      }).catch(() => {
        _this.$message.error(msg, 10)
      }).finally(() => {
        this.$message.info(msg, 10)
        _this.loading = false
        _this.visible = false
      })
    },
    setCourseInfo (CourseInfo) {
      const processed = []
      this.pageSize = parseInt(9 / (CourseInfo.length / 18))
      for (let i = 0; i < this.defaultWeek; i++) {
        processed.push(null)
      }
      CourseInfo.forEach((row) => {
        const weekNum = parseInt(row.周次号)
        if (weekNum <= parseInt(this.defaultWeek)) {
          this.weekUsageList[weekNum - 1].value = parseInt(row.当周开课) !== 0
          if (processed[weekNum - 1] === null) {
            processed[weekNum - 1] = {
              key: weekNum,
              courseWeek: weekNum - 1,
              courseId: row.课程号,
              classId: row.班级号,
              comment: row.备注,
              online: row.线上教学,
              adjusted: row.调停课业务号,
              courseInfo: {
                key: weekNum
              },
              weekStatus: {},
              loadingStatus: false
            }
          }
          const infoKey = row.星期号 + row.节次号
          processed[weekNum - 1]['weekStatus'][infoKey] = {
            courseId: row.课程号,
            classId: row.班级号,
            weekNum: weekNum,
            key: infoKey,
            week: row.meta.week,
            date: row.meta.date,
            oldClassroom: row.meta.classroom,
            newClassroom: (row.临时教室号 ? row.临时教室号 : row.meta.classroom),
            tags: (row.备选教室号 ? row.备选教室号.split(',') : []),
            comment: row.备注,
            online: row.线上教学,
            adjusted: row.调停课业务号,
            isAdjustDisabled: this.isAdjustDisabled(weekNum, row.星期号)
          }
        }
      })

      this.columnData = processed
    },
    getWeekStatus (week) {
      return this.columnData[parseInt(week) - 1]['weekStatus']
    },
    isShowHeader (key) {
      return key % this.pageSize === 1
    },
    getWeekLoadingStatus (week) {
      return this.columnData[parseInt(week) - 1].loadingStatus
    },
    initWeekUsageList () {
      const checkList = []
      for (let i = 0; i < this.defaultWeek; i++) {
        checkList.push({
          key: `checked${i + 1}`,
          value: true,
          week: `第${i + 1}周`,
          weekNum: i + 1
        })
      }
      this.weekUsageList = checkList
    },
    setCourseTime (CourseTimeInfo) {
      // console.log(CourseTimeInfo)
    },
    setCourseAdjustInfo (weekSelectedRows, weekNum) {
      if (weekSelectedRows.length === 0) {
        delete this.adjustedCourse[weekNum]
      } else {
        this.adjustedCourse[weekNum] = weekSelectedRows
      }
      this.adjustTimeCaculator(this.adjustedCourse)
    },
    convertClasstimeDate (date) {
      if (date === 1) {
        return [1, 2]
      } else if (date === 2) {
        return [3]
      } else if (date === 3) {
        return [4]
      } else if (date === 4) {
        return [5]
      } else if (date === 5) {
        return [6, 7]
      } else if (date === 6) {
        return [8, 9]
      } else if (date === 7) {
        return [10, 11, 12]
      }
      return false
    },
    convertDateList (dateList) {
      const processed = []
      dateList.forEach((date) => {
        console.log(this.convertClasstimeDate(date))
        processed.push(...this.convertClasstimeDate(date))
      })
      const minDate = Math.min(...processed)
      const maxDate = Math.max(...processed)
      console.log('processed', processed, dateList, minDate, maxDate)
      return (minDate + '-' + maxDate)
    },
    getDateByWeekNum (weekNum, week) {
      const startDate = moment(this.$store.state.termStartDate)
      const delta = (weekNum - 1) * 7 + (week - 1)
      return startDate.add(delta, 'days')
    },
    isAdjustDisabled (weekNum, week) {
      const day = this.getDateByWeekNum(weekNum, week)
      console.log(moment().diff(day, 'days'))
      return moment().diff(day, 'days') > 7
    },
    adjustTimeCaculator (adjustedCourse) {
      let adjustedString = ''
      const dateDict = {}
      for (const weekNum in adjustedCourse) {
        for (const index in adjustedCourse[weekNum]) {
          const course = adjustedCourse[weekNum][index]
          const week = course.key.substring(0, 1)
          const date = course.key.substring(1, 2)
          const courseDate = this.getDateByWeekNum(weekNum, week)
          if (courseDate in dateDict) {
            dateDict[courseDate].push(parseInt(date))
          } else {
            dateDict[courseDate] = [parseInt(date)]
          }
        }
      }
      for (const cDate in dateDict) {
        adjustedString += (moment(cDate).format('YYYY-MM-DD') + '【' + this.convertDateList(dateDict[cDate]) + '节】')
      }
      this.adjustedString = adjustedString
    },
    saveWeekChange (info) {
      const parameter = JSON.parse(JSON.stringify(info))
      info.forEach((weekInfo, index) => {
        parameter[index].tags = parameter[index].tags.toString()
      })
      this.columnData[parameter[0].weekNum - 1 ].loadingStatus = true
      saveWeekStatus(parameter).then((response) => {
        this.columnData[parameter[0].weekNum - 1].loadingStatus = false
      })
    },
    displayAdjustButton () {
      if (this.adjustedString.length > 0) {
        this.submitButtonText = '提交调停课'
      } else {
        this.submitButtonText = '提交变更'
      }
      return this.adjustedString.length > 0
    },
    pushAdjustedCourse () {
      this.loading = true
      const parameter = {
        'adjustmentInfo': this.adjustedCourse,
        'courseInfo': this.courseInfo
      }
      commitCourseAdjustment(parameter).then(() => {
        this.loading = false
        this.visible = false
      })
    }
  }

}
</script>

<style scoped>
.ant-col-sm-12 {
    display: block;
    -webkit-box-sizing: border-box;
    box-sizing: border-box;
    width: 80%;
}
.ant-form-item {
    margin-bottom: 0px;
  }

</style>
