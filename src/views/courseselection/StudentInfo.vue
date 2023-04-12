<template>
  <a-space>
    <a-form class="apply-info-wrapper ant-form-item" layout="inline">
      <a-form-item label="学生信息查询：" :label-col="{span:0, offset:0}" >
        <a-input-search
          v-model="studentId"
          placeholder="请输入学生学号"
          enter-button
          :loading="loading"
          @search="this.pushselectedCourses"
        />
      </a-form-item>
      <div v-if="JSON.stringify(this.$store.state.studentInfo) !== '{}'">
        <a-form-item label="姓名" layout="inline"> {{ this.$store.state.studentInfo.姓名 }} </a-form-item>
        <a-form-item label="学号" layout="inline"> {{ this.$store.state.studentInfo.学号 }} </a-form-item>
        <a-form-item label="学院" layout="inline"> {{ this.$store.state.studentInfo.单位 }} </a-form-item>
        <a-form-item label="专业" layout="inline"> {{ this.$store.state.studentInfo.专业 }}</a-form-item>
        <a-form-item label="班级" layout="inline"> {{ this.$store.state.studentInfo.班级 }} </a-form-item>
        <a-table size="small" :pagination="false" :dataSource="this.$store.state.selectedCourses" :columns="this.columns">

        </a-table>
        <div class="select-course-submit" v-if="JSON.stringify(this.$store.state.reservedCourses) !== '{}'">
          <span style="margin-right: 20px"> 已增选 <b>{{ selectedAmount }} </b>门课程</span>
          <span>
            <a-button
              type="primary"
              @click="doReserveCourse"
              :loading="loading">
              提交补课申请
            </a-button>
          </span>

        </div>

      </div>

    </a-form></a-space>
<!--    <a-card>-->
<!--      <a-form>-->
<!--        <a-form-item :key="item.id" v-for="item in selectedCourses">-->
<!--          {{ item.name }}-->
<!--        </a-form-item>-->
<!--      </a-form>-->

<!--    </a-card>-->

</template>

<script>

import { commitCourseAdjustment, getStudentSelectedCourses, reserveCourse } from '@/api/manage'

export default {
  name: 'StudentInfo',
  data () {
    return {
      loading: false,
      studentId: null,
      stuInfo: null,
      selectedCourses: [],
      columns: [
          {
            title: '课程名称',
            dataIndex: '课程名称',
            key: 'name',
            ellipsis: true
          },
          {
            title: '班级名称',
            dataIndex: '班级名称',
            key: '班级名称'
          },
          {
            title: '状态',
            dataIndex: '状态',
            key: '已选课程'
          }
        ]
    }
  },
  methods: {
    pushselectedCourses () {
      this.loading = true
      this.$store.dispatch('getSelectedCourses', this.studentId).then((data) => {
        this.loading = false
        if (data.hasOwnProperty('error')) {
          this.$message.error(data.error, 5)
        }
      }).catch((err) => {
        this.$message.error(err, 10)
        this.$store.commit('LOADED', true)
      })
    },
    doReserveCourse () {
      this.loading = true
      const parameter = {
        'course': this.$store.state.reservedCourses,
        'stu_info': this.$store.state.studentInfo
      }
      reserveCourse(parameter).then((result) => {
        if (result !== '') {
          this.$message.info(result, 10)
          this.$store.dispatch('clearSelectedAndReservedCourse').then(
            this.pushselectedCourses
          ).catch(() => {
            this.$message.error('更新数据时出错，请刷新页面重试！', 10)
            this.$store.commit('LOADED', true)
          })
          }
        this.loading = false
        this.visible = false
      })
    }
    // getSelectedCourses () {
    //   const _this = this
    //   this.loading = true
    //   const params = {
    //     'stu_id': _this.studentId
    //   }
    //   getStudentSelectedCourses(params).then(res => {
    //       this.setSelectedCourses(res)
    //     }).catch((err) => {
    //     }).finally(() => {
    //     _this.loading = false
    //   })
    // },
    // setSelectedCourses (result) {
    //   if (result.hasOwnProperty('data')) {
    //     this.stuInfo = result.data
    //   } else {
    //     this.$message.error(result)
    //     this.stuInfo = null
    //   }
    //   if (result.hasOwnProperty('selected')) {
    //     this.selectedCourses = result.selected
    //   }
    // }
  },
  computed: {
    selectedAmount () {
      const reservedAmount = Object.keys(this.$store.state.reservedCourses).length
      const selectAmount = this.$store.state.selectedCourses.filter(item => item.状态 === '待教务处审核').length
      return reservedAmount + selectAmount
    }
  }
}

</script>

<style scoped>
.select-course-submit{
  float: right;
  margin-right: 15%;
  margin-top: 10px;
  }
</style>
