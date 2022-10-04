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
      title="提交申请"
      okText="提交申请"
      width="900px"
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
            <a-checkable-tag v-for="check in weekUsageList" :key="check.key" v-model:checked="check.value">{{ check.week }}</a-checkable-tag>
          </div>
        </a-form-item>
        <a-form-item label="">
          <a-table :data-source="columnData" size="small" :pagination="{ pageSize: this.pageSize }">
            <a-table-column title="周次" data-index="key">
              <template v-slot="key">
                第{{ key }}周
              </template>
            </a-table-column>
            <a-table-column title="开课" data-index="courseWeek">
              <template v-slot="courseWeek">
                <a-switch v-model:checked="weekUsageList[courseWeek].value" size="small"/>
              </template>
            </a-table-column>
            <a-table-column title="课程信息" data-index="courseInfo">
              <template v-slot="courseInfo">
                <courseTimeTable @syncCourseTime="setCourseTime" @pushWeekChange="saveWeekChange" :weekDetail="getWeekStatus(courseInfo.key)" :loading="getWeekLoadingStatus(courseInfo.key)" :enable="weekUsageList[parseInt(courseInfo.key) - 1].value"></courseTimeTable>
              </template>
            </a-table-column>
          </a-table>
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script>

import courseTimeTable from '@/components/SubmitPanel/courseTimeTable'
import { getCourseStatus, saveCourseStatus, saveWeekStatus } from '@/api/manage'

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
      pageSize: 10,
      weekUsageList: [],
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
      }).catch(() => {
        _this.$message.error('内部错误，请重试', 10)
      }).finally(() => {
        _this.loading = false
        _this.visible = true
      })
    },
    handleCancel () {
      this.visible = false
    },
    handlePush () {
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
      saveCourseStatus(pushList).then(res => {
        console.log(res)
      }).catch(() => {
        _this.$message.error('内部错误，请重试', 10)
      }).finally(() => {
        _this.loading = false
        _this.visible = false
      })
    },
    setCourseInfo (CourseInfo) {
      const processed = []
      this.pageSize = parseInt(9 / (CourseInfo.length / 17))
      for (let i = 0; i < 17; i++) {
        processed.push(null)
        }
      CourseInfo.forEach((row) => {
        const weekNum = parseInt(row.周次号)
        this.weekUsageList[weekNum - 1].value = parseInt(row.当周开课) !== 0
        if (processed[weekNum - 1] === null) {
          processed[weekNum - 1] = {
            key: weekNum,
            courseWeek: weekNum - 1,
            courseId: row.课程号,
            classId: row.班级号,
            courseInfo: {
              key: weekNum
            },
            weekStatus: {
            },
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
          comments: null
        }
      })

      this.columnData = processed
    },
    getWeekStatus (week) {
      return this.columnData[parseInt(week) - 1]['weekStatus']
    },
    getWeekLoadingStatus (week) {
      return this.columnData[parseInt(week) - 1].loadingStatus
    },
    initWeekUsageList () {
      const checkList = []
      for (let i = 0; i < 17; i++) {
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
      console.log(CourseTimeInfo)
    },
    saveWeekChange (info) {
      const parameter = JSON.parse(JSON.stringify(info))
      console.log(parameter)
      info.forEach((weekInfo, index) => {
        parameter[index].tags = parameter[index].tags.toString()
      })
      this.columnData[parameter[0].weekNum - 1 ].loadingStatus = true
      saveWeekStatus(parameter).then((response) => {
        this.columnData[parameter[0].weekNum - 1].loadingStatus = false
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
