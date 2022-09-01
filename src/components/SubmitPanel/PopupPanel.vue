<template>
  <div ref="wrapper">
    <a-dropdown-button
      type="primary"
      @click="showModal"
    >
      变更申请
    </a-dropdown-button>
    <a-modal
      :visible="visible"
      title="提交申请"
      okText="提交申请"
      @cancel="() => { handleCancel() }"
      @ok="() => { handlePush() }"
    >
      <a-form class="apply-info-wrapper ant-form-item" :label-col="labelCol" width="80%" >
        <a-form-item label="管理单位" layout="inline"> <a>{{ courseInfo.college }}</a> </a-form-item>
        <a-form-item label="课程名称" layout="inline"> <a>{{ courseInfo.course_name }}</a> </a-form-item>
        <a-form-item label="班级名称" layout="inline"> <a>{{ courseInfo.class_name }}</a> </a-form-item>
        <a-form-item label="任课教师" layout="inline"> <a>{{ courseInfo.teacher_name }}</a> </a-form-item>
        <a-form-item label="开课周次">
          <div>
            <a-checkable-tag v-for="check in weekUsageList" :key="check.key" v-model:checked="check.value" @change="handleChange">{{ check.week }}</a-checkable-tag>
          </div>
        </a-form-item>
        <a-form-item label="">
          <a-table :data-source="columnData" size="small">
            <a-table-column title="周次" data-index="key">
              <template v-slot="key">
                第{{ key }}周
              </template>
            </a-table-column>
            <a-table-column title="开课否" data-index="courseWeek">
              <template v-slot="courseWeek">
                <a-switch v-model:checked="weekUsageList[courseWeek.week].value" />
              </template>
            </a-table-column>
            <a-table-column title="courseInfo" data-index="courseInfo">
              <template v-slot="courseInfo">
              <testPanel></testPanel>
              </template>
            </a-table-column>
          </a-table>
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script>
import testPanel from '@/components/SubmitPanel/testPanel'

const provinceData = ['Zhejiang', 'Jiangsu']
export default {
  name: 'PopupPanel',
  components: {
      testPanel
    },
  data () {
    return {
      visible: false,
      teacher_id: null,
      college_name: null,
      columnData: null,
      weekUsageList: [],
      testData: provinceData[0],
      labelCol: {
        // style: { width: '150px' },
        xs: { span: 8 },
        sm: { span: 4 }
        },
      wrapperCol: {
        xs: { span: 12 },
        sm: { span: 12 }
      }
    }
  },
  created () {
    this.initWeekUsageList()
    this.setColumnData()
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
        this.visible = true
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
    handleChange (checked) {
      console.log(checked)
    },
    setColumnData () {
      const rowsData = []
      for (let i = 1; i < 18; i++) {
        rowsData.push({
          key: i,
          courseWeek: {
            week: i - 1,
            on: true
            },
          courseInfo: this.courseInfo
          })
        }
      this.columnData = rowsData
    },
    initWeekUsageList () {
      const checkList = []
      for (let i = 1; i < 18; i++) {
        checkList.push({
          key: `checked${i}`,
          value: true,
          week: `第${i}周`
        })
      }
      this.weekUsageList = checkList
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
