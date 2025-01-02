<template>
  <div class="lookup-conditions">
    <a-form layout="inline">
      <a-form-item label="单位名称">
        <a-input class="w-120px" v-model="queryParams.collegeName" allow-clear />
      </a-form-item>
      <a-form-item label="课程名称">
        <a-input class="w-120px" v-model="queryParams.courseName" allow-clear />
      </a-form-item>
      <a-form-item label="课程号">
        <a-input class="w-80px" v-model="queryParams.courseId" allow-clear />
      </a-form-item>
      <!-- <a-form-item label="班级名称">
        <a-input class="w-120px" v-model="queryParams.className" allow-clear />
      </a-form-item>
      <a-form-item label="教师工号">
        <a-input class="w-100px" v-model="queryParams.teacherId" allow-clear />
      </a-form-item> -->
      <a-form-item label="教师姓名">
        <a-input class="w-100px" v-model="queryParams.teacherName" allow-clear />
      </a-form-item>
      <a-form-item label="平时成绩提交">
        <a-select class="w-100px" v-model="queryParams.regularSubmitted" allow-clear>
          <a-select-option value="submitted">已提交</a-select-option>
          <a-select-option value="submitting">提交中</a-select-option>
          <a-select-option value="unsubmitted">未提交</a-select-option>
          <a-select-option value="unnecessary">无需提交</a-select-option>
        </a-select>
      </a-form-item>
      <a-form-item label="期中成绩提交">
        <a-select class="w-100px" v-model="queryParams.midtermSubmitted" allow-clear>
          <a-select-option value="submitted">已提交</a-select-option>
          <a-select-option value="submitting">提交中</a-select-option>
          <a-select-option value="unsubmitted">未提交</a-select-option>
          <a-select-option value="unnecessary">无需提交</a-select-option>
        </a-select>
      </a-form-item>
      <a-form-item label="总评成绩提交">
        <a-select class="w-100px" v-model="queryParams.totalSubmitted" allow-clear>
          <a-select-option value="submitted">已提交</a-select-option>
          <a-select-option value="submitting">提交中</a-select-option>
          <a-select-option value="unsubmitted">未提交</a-select-option>
        </a-select>
      </a-form-item>
      <a-form-item>
        <a-space>
          <a-button type="primary" @click="handleSearch">查询</a-button>
          <a-button @click="handleReset">重置</a-button>
          <a-button type="primary" @click="$emit('export')">导出</a-button>
          <a-button type="primary" @click="$emit('showProgress')">
            查看学院提交进度
          </a-button>
        </a-space>
      </a-form-item>
    </a-form>
  </div>
</template>

<script>
export default {
  name: 'LookupConditions',
  data () {
    return {
      queryParams: {
        collegeName: '',
        courseName: '',
        courseId: '',
        className: '',
        teacherId: '',
        teacherName: '',
        regularSubmitted: '',
        totalSubmitted: '',
        midtermSubmitted: ''
      }
    }
  },
  methods: {
    getQueryParams () {
      const params = {}
      Object.keys(this.queryParams).forEach(key => {
        if (this.queryParams[key]) {
          params[key] = this.queryParams[key]
        }
      })
      return params
    },
    handleSearch () {
      const params = this.getQueryParams()
      // 只有当存在需要后端过滤的参数时才重新获取数据
      if (params.collegeName || params.courseName || params.courseId || 
          params.teacherName || params.className || params.teacherId ||
          params.regularSubmitted || params.midtermSubmitted || params.totalSubmitted) {
        this.$emit('filter', this.queryParams)
      } else {
        // 如果没有任何筛选参数，也需要触发一次筛选
        this.$parent.filterData(
          params.regularSubmitted,
          undefined,
          false,
          params.midtermSubmitted,
          params.totalSubmitted
        )
      }
    },
    handleReset () {
      this.queryParams = {
        collegeName: '',
        courseName: '',
        courseId: '',
        className: '',
        teacherId: '',
        teacherName: '',
        regularSubmitted: '',
        totalSubmitted: '',
        midtermSubmitted: ''
      }
      this.$emit('filter', this.queryParams)
    }
  }
}
</script>

<style scoped>
  .lookup-conditions {
    margin: 0 0 10px 0;
  }

  .w-200px {
    width: 200px;
  }

  .w-140px {
    width: 140px;
  }

  .w-120px {
    width: 120px;
  }

  .w-100px {
    width: 100px;
  }

  .w-80px {
    width: 80px;
  }
  .w-60px {
    width: 60px;
  }
</style>
