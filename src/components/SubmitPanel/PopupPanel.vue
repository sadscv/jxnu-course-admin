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
                <a-switch v-model:checked="weekUsageList[courseWeek.week].value"  size="small"/>
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
import { getCourseStatus, saveWeekStatus } from '@/api/manage'

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
      return new Promise((resolve) => {
        this.$emit('pushSelectedClassroom',
            this.$store.state.currentBuilding,
            this.rawSelectedData,
            this.appliedClassrooms,
            this.currentTeacher.教号,
            this.currentTeacher.姓名,
            this.college_name
        )
        setTimeout(() => {
          this.visible = false
        }, 0)
        resolve()
        })
    },
    setCourseInfo (CourseInfo) {
      const processed = []
      this.pageSize = parseInt(9 / (CourseInfo.length / 17))
      for (let i = 1; i < 18; i++) {
        processed.push(null)
        }
      CourseInfo.forEach((row) => {
        if (processed[parseInt(row.周次号) - 1] === null) {
          processed[parseInt(row.周次号) - 1] = {
            key: row.周次号,
            courseWeek: {
              week: row.周次号 - 1,
              on: false
            },
            courseInfo: {
              key: row.周次号
            },
            weekStatus: {
            },
            loadingStatus: false
          }
        }
        const infoKey = row.星期号 + row.节次号
        processed[parseInt(row.周次号) - 1]['weekStatus'][infoKey] = {
          courseId: row.课程号,
          classId: row.班级号,
          weekNum: parseInt(row.周次号),
          key: infoKey,
          week: row.meta.week,
          date: row.meta.date,
          oldClassroom: row.meta.classroom,
          newClassroom: (row.临时教室号 ? row.临时教室号 : row.meta.classroom),
          tags: (row.备选教室号 ? row.备选教室号.split(',') : [])
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
      for (let i = 1; i < 18; i++) {
        checkList.push({
          key: `checked${i}`,
          value: true,
          week: `第${i}周`,
          weekNum: i
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
    },
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
