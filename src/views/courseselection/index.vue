<template>
  <page-header-wrapper :title="false">
    <div class="student-info-panel-wrapper">
      <div style="width: 29%; float:left">
        <StudentInfo/>
      </div>
      <div style="width: 70%; float:right">
        <CourseTable/>
      </div>
    </div>
  </page-header-wrapper>
</template>

<script>
import StudentInfo from './StudentInfo'
import CourseTable from './CourseTable'

export default {
  name: 'CourseSelection',
  components: {
    StudentInfo,
    CourseTable
  },
  created () {
      this.$nextTick(() => {
        this.updateData()
       })
    },
  methods: {
    getInfo (row) {
      return row
    },
    updateData () {
      // const hide = this.$message.loading('正在检查数据更新...', 0);
      this.$store.dispatch('checkUpdateAllInfos').then((data) => {
        if (data != null) {
        } else {
          this.$message.error('未获取到基础数据，请刷新页面重试！', 30)
        }
      }).catch(() => {
        this.$message.error('更新基础数据时出错，请刷新页面重试！', 30)
        this.$store.commit('LOADED', true)
      })
      return null
    }
    }
}
</script>

<style scoped>
.student-info-panel-wrapper {
    padding-top: 1px;
  }
</style>
