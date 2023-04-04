<template>
  <a-space>
    <a-form class="apply-info-wrapper ant-form-item" layout="inline">
      <a-form-item label="学生信息查询：" :label-col="{span:0, offset:0}" >
        <a-input-search
          v-model="studentId"
          placeholder="请输入学生学号"
          enter-button
          :loading="loading"
          @search="getSelectedCourses"
        />
      </a-form-item>
      <div v-if="this.stuInfo !== null">
        <a-form-item label="姓名" layout="inline"> {{ this.stuInfo.姓名 }} </a-form-item>
        <a-form-item label="学号" layout="inline"> {{ this.stuInfo.学号 }} </a-form-item>
        <a-form-item label="学院" layout="inline"> {{ this.stuInfo.单位 }} </a-form-item>
        <a-form-item label="专业" layout="inline"> {{ this.stuInfo.专业 }}</a-form-item>
        <a-form-item label="班级" layout="inline"> {{ this.stuInfo.班级 }} </a-form-item>
        <a-table size="small" :pagination="false" :dataSource="this.selectedCourses" :columns="this.columns"></a-table>
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

import { getStudentSelectedCourses } from '@/api/manage'

export default {
  name: 'StudentInfo',
  data () {
    return {
      loading: false,
      studentId: null,
      stuInfo: null,
      selectedCourses: [],
      dataSource: [
          {
            key: '1',
            name: '胡彦斌',
            age: 32,
            address: '西湖区湖底公园1号'
          },
          {
            key: '2',
            name: '胡彦祖',
            age: 42,
            address: '西湖区湖底公园1号'
          }
        ],
      columns: [
          {
            title: '课程名称',
            dataIndex: '课程名称',
            key: 'name'
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
    getSelectedCourses () {
      const _this = this
      this.loading = true
      const params = {
        'stu_id': _this.studentId
      }
      getStudentSelectedCourses(params).then(res => {
          this.setSelectedCourses(res)
        }).catch((err) => {
        }).finally(() => {
        _this.loading = false
      })
    },
    setSelectedCourses (result) {
      if (result.hasOwnProperty('data')) {
        this.stuInfo = result.data
      } else {
        this.$message.error(result)
        this.stuInfo = null
      }
      if (result.hasOwnProperty('selected')) {
        this.selectedCourses = result.selected
      }
    }
  }
}

</script>

<style scoped>
</style>
