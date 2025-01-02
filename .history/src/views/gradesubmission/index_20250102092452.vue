<template>
  <page-header-wrapper :title="false">
    <div class="grade-submission-wrapper">
      <LookupConditions ref="conditions" @filter="fetchData" @export="exportData" />
      
      <a-table
        ref="table"
        class="table"
        :loading="tableLoading"
        :data-source="rows"
        :locale="{emptyText: '没有匹配的记录'}"
        :pagination="pagination"
        @change="handleTableChange"
      >
        <a-table-column 
          title="课程管理单位" 
          data-index="college"
          column-key="college"
          :sorter="true"
        >
          <template v-slot="college">
            <strong>{{ college.name }}</strong>
          </template>
        </a-table-column>

        <a-table-column 
          title="课程信息" 
          data-index="course"
          column-key="course"
          :sorter="true"
        >
          <template v-slot="course">
            <div class="course-info">
              <strong class="course-name">{{ course.name }}</strong>
              <small class="text-secondary">课程号：{{ course.id.trim() }}</small>
            </div>
          </template>
        </a-table-column>

        <a-table-column title="班级信息" data-index="class_info">
          <template v-slot="class_info">
            <div>
              <strong>{{ class_info.name }}</strong>
              <br/>
              <small class="text-secondary">班级号：{{ class_info.id.trim() }}</small>
              <!-- <div class="student-count">学生数：{{ class_info.submission_status.student_count }}人</div> -->
            </div>
          </template>
        </a-table-column>

        <a-table-column 
          title="任课教师" 
          data-index="teacher"
          column-key="teacher"
          :sorter="true"
        >
          <template v-slot="teacher">
            <div>
              <strong>{{ teacher.name }}</strong>
              <br/>
              <small class="text-secondary">工号：{{ teacher.id.trim() }}</small>
            </div>
          </template>
        </a-table-column>

        <a-table-column title="成绩比例" data-index="submission_status">
          <template v-slot="status">
            <div class="score-weights">
              <div class="weights-row">
                <template v-if="status.score_weights.regular > 0">
                  <a-tag class="weight-item" color="blue">
                    平时 {{ status.score_weights.regular * 100 }}%
                  </a-tag>
                </template>
                <template v-if="status.score_weights.midterm > 0">
                  <a-tag class="weight-item" color="blue">
                    期中 {{ status.score_weights.midterm * 100 }}%
                  </a-tag>
                </template>
                <template v-if="status.score_weights.practice > 0">
                  <a-tag class="weight-item" color="blue">
                    实践 {{ status.score_weights.practice * 100 }}%
                  </a-tag>
                </template>
                <template v-if="status.score_weights.final > 0">
                  <a-tag class="weight-item" color="blue">
                    期末 {{ status.score_weights.final * 100 }}%
                  </a-tag>
                </template>
              </div>
              <div class="total-row" :class="{'error-text': !isValidProportion(status.score_weights)}">
                合计: {{ calculateTotal(status.score_weights) * 100 }}%
              </div>
            </div>
          </template>
        </a-table-column>

        <a-table-column title="平时成绩提交" data-index="submission_status">
          <template v-slot="status">
            <div class="d-flex align-items-center">
              <a-tag :color="getSubmitStatusColor(status, 'regular')">
                {{ getSubmitStatusText(status, 'regular') }}
              </a-tag>
              <small v-if="!(isValidProportion(status.score_weights) && status.score_weights.regular === 0)" 
                     class="text-secondary ms-2">
                {{ status.regular_submitted_count }}/{{ status.student_count }}
              </small>
            </div>
            <div v-if="!(isValidProportion(status.score_weights) && status.score_weights.regular === 0)" 
                 class="mt-1">
              <a-progress
                :percent="calculateSubmitPercentage(status, 'regular')"
                size="small"
                :status="getProgressStatus(status, 'regular')"
              />
            </div>
          </template>
        </a-table-column>

        <a-table-column title="期中成绩提交" data-index="submission_status">
          <template v-slot="status">
            <template v-if="!(isValidProportion(status.score_weights) && status.score_weights.midterm === 0)">
              <div class="d-flex align-items-center">
                <a-tag :color="getSubmitStatusColor(status, 'midterm')">
                  {{ getSubmitStatusText(status, 'midterm') }}
                </a-tag>
                <small class="text-secondary ms-2">
                  {{ status.midterm_submitted_count }}/{{ status.student_count }}
                </small>
              </div>
              <div class="mt-1">
                <a-progress
                  :percent="calculateSubmitPercentage(status, 'midterm')"
                  size="small"
                  :status="getProgressStatus(status, 'midterm')"
                />
              </div>
            </template>
            <template v-else>
              <a-tag color="green">无需提交</a-tag>
            </template>
          </template>
        </a-table-column>

        <a-table-column title="总评提交状态" data-index="submission_status">
          <template v-slot="status">
            <div class="d-flex align-items-center">
              <a-tag :color="getTotalSubmitStatusColor(status)">
                {{ getTotalSubmitStatusText(status) }}
              </a-tag>
              <small class="text-secondary ms-2">
                {{ calculateMinSubmittedCount(status) }}/{{ status.student_count }}
              </small>
            </div>
            <div class="mt-1">
              <a-progress
                :percent="calculateTotalSubmitPercentage(status)"
                size="small"
                :status="getTotalProgressStatus(status)"
              />
            </div>
            <div v-if="status.last_submit_time" class="mt-1">
              <small class="text-secondary">
                最后提交: {{ formatDate(status.last_submit_time) }}
              </small>
            </div>
            <div v-if="status.last_submit_by" class="mt-1">
              <small class="text-secondary">
                提交人: {{ status.last_submit_by }}
              </small>
            </div>
          </template>
        </a-table-column>

      </a-table>
    </div>
  </page-header-wrapper>
</template>

<script>
import { getGradeSubmissionList } from '@/api/grade'
import LookupConditions from './LookupConditions'
import moment from 'moment'
import { saveAs } from 'file-saver'
import * as XLSX from 'xlsx-js-style'

export default {
  name: 'GradeSubmission',
  components: {
    LookupConditions
  },
  data () {
    return {
      tableLoading: false,
      rows: [],
      rawData: [],
      pagination: {
        current: 1,
        pageSize: 10,
        total: 0,
        showTotal: total => `共 ${total} 条记录`
      }
    }
  },
  methods: {
    async fetchData (params = {}) {
      this.tableLoading = true
      try {
        const queryParams = this.$refs.conditions ? this.$refs.conditions.getQueryParams() : {}
        const { regularSubmitted, midtermSubmitted, totalSubmitted, ...apiParams } = queryParams
        
        const { data } = await getGradeSubmissionList({
          ...apiParams
        })
        
        this.rawData = data.data
        this.filterData(regularSubmitted, undefined, false, midtermSubmitted, totalSubmitted)
      } catch (error) {
        this.$message.error('获取数据失败：' + error.message)
      } finally {
        this.tableLoading = false
      }
    },
    filterData(regularSubmitted, sorter, keepCurrentPage = false, midtermSubmitted, totalSubmitted) {
      let filteredData = this.rawData
      const queryParams = this.$refs.conditions ? this.$refs.conditions.getQueryParams() : {}
      
      // 平时成绩提交状态筛选
      if (regularSubmitted !== undefined) {
        filteredData = filteredData.filter(item => {
          // 如果选择"无需提交"，只显示成绩比例合计为100%且平时成绩比例为0的记录
          if (regularSubmitted === 'unnecessary') {
            return this.isValidProportion(item.submission_status.score_weights) && 
                   item.submission_status.score_weights.regular === 0
          }
          
          // 对于其他所有筛选条件，都应该排除成绩比例合计为100%且平时成绩比例为0的记录
          if (this.isValidProportion(item.submission_status.score_weights) && 
              item.submission_status.score_weights.regular === 0) {
            return false
          }
          
          const percentage = this.calculateSubmitPercentage(item.submission_status, 'regular')
          const threshold = item.submission_status.student_count < 20 ? 60 : 80
          switch (regularSubmitted) {
            case 'submitted':
              return percentage >= threshold
            case 'submitting':
              return percentage > 0 && percentage < threshold
            case 'unsubmitted':
              return percentage === 0
            default:
              return true
          }
        })
      }

      // 期中成绩提交状态筛选
      if (midtermSubmitted !== undefined) {
        filteredData = filteredData.filter(item => {
          // 如果选择"无需提交"，只显示成绩比例合计为100%且期中成绩比例为0的记录
          if (midtermSubmitted === 'unnecessary') {
            return this.isValidProportion(item.submission_status.score_weights) && 
                   item.submission_status.score_weights.midterm === 0
          }
          
          // 对于其他所有筛选条件，都应该排除成绩比例合计为100%且期中成绩比例为0的记录
          if (this.isValidProportion(item.submission_status.score_weights) && 
              item.submission_status.score_weights.midterm === 0) {
            return false
          }
          
          const percentage = this.calculateSubmitPercentage(item.submission_status, 'midterm')
          const threshold = item.submission_status.student_count < 20 ? 60 : 80
          switch (midtermSubmitted) {
            case 'submitted':
              return percentage >= threshold
            case 'submitting':
              return percentage > 0 && percentage < threshold
            case 'unsubmitted':
              return percentage === 0
            default:
              return true
          }
        })
      }

      // 总评成绩提交状态筛选
      if (totalSubmitted !== undefined) {
        filteredData = filteredData.filter(item => {
          const percentage = this.calculateTotalSubmitPercentage(item.submission_status)
          const threshold = item.submission_status.student_count < 20 ? 60 : 80
          switch (totalSubmitted) {
            case 'submitted':
              return percentage >= threshold
            case 'submitting':
              return percentage > 0 && percentage < threshold
            case 'unsubmitted':
              return percentage === 0
            default:
              return true
          }
        })
      }

      if (queryParams.validProportion !== undefined) {
        filteredData = filteredData.filter(item => {
          const isValid = this.isValidProportion(item.submission_status.score_weights)
          return queryParams.validProportion ? isValid : !isValid
        })
      }

      // 最后才进行排序处理
      if (sorter && sorter.order) {
        const { columnKey, order } = sorter
        filteredData = [...filteredData].sort((a, b) => {
          let result = 0
          switch (columnKey) {
            case 'college':
              result = a.college.name.localeCompare(b.college.name, 'zh-CN')
              break
            case 'course':
              result = a.course.name.localeCompare(b.course.name, 'zh-CN')
              break
            case 'teacher':
              result = a.teacher.name.localeCompare(b.teacher.name, 'zh-CN')
              break
          }
          return order === 'ascend' ? result : -result
        })
      }
      
      // 更新分页信息和当前页数据
      this.pagination = {
        ...this.pagination,
        total: filteredData.length,
        current: keepCurrentPage ? this.pagination.current : 1
      }
      
      const start = (this.pagination.current - 1) * this.pagination.pageSize
      const end = start + this.pagination.pageSize
      this.rows = filteredData.slice(start, end)
    },
    handleTableChange (pagination, filters, sorter) {
      this.pagination.current = pagination.current
      const queryParams = this.$refs.conditions ? this.$refs.conditions.getQueryParams() : {}
      this.filterData(
        queryParams.regularSubmitted,
        sorter,
        true,
        queryParams.midtermSubmitted,
        queryParams.totalSubmitted
      )
    },
    formatDate (date) {
      return date ? moment(date).format('YYYY-MM-DD HH:mm:ss') : '-'
    },
    calculateTotal (weights) {
      return weights.regular + weights.midterm + weights.practice + weights.final
    },
    isValidProportion (weights) {
      return Math.abs(this.calculateTotal(weights) - 1) < 0.0001
    },
    calculateSubmitPercentage(status, type = 'regular') {
      if (!status.student_count) return 0
      const submittedCount = type === 'regular' ? status.regular_submitted_count : status.midterm_submitted_count
      return Math.round((submittedCount / status.student_count) * 100)
    },
    getProgressStatus(status, type = 'regular') {
      if (this.isValidProportion(status.score_weights) && 
          status.score_weights[type] === 0) {
        return 'success'
      }
      
      const percentage = this.calculateSubmitPercentage(status, type)
      const threshold = status.student_count < 20 ? 60 : 80
      if (percentage === 0) return 'exception'
      if (percentage >= threshold) return 'success'
      return 'active'
    },
    getSubmitStatusColor(status, type = 'regular') {
      if (this.isValidProportion(status.score_weights) && 
          status.score_weights[type] === 0) {
        return 'green'
      }
      
      const percentage = this.calculateSubmitPercentage(status, type)
      const threshold = status.student_count < 20 ? 60 : 80
      if (percentage >= threshold) return 'green'
      if (percentage > 0) return 'orange'
      return 'red'
    },
    getSubmitStatusText(status, type = 'regular') {
      if (this.isValidProportion(status.score_weights) && 
          status.score_weights[type] === 0) {
        return '无需提交'
      }
      
      const percentage = this.calculateSubmitPercentage(status, type)
      const threshold = status.student_count < 20 ? 60 : 80
      if (percentage >= threshold) return '已提交'
      if (percentage > 0) return '提交中'
      return '未提交'
    },
    calculateTotalSubmitPercentage(status) {
      if (!status.student_count) return 0
      return Math.round((this.calculateMinSubmittedCount(status) / status.student_count) * 100)
    },
    getTotalSubmitStatusColor(status) {
      const percentage = this.calculateTotalSubmitPercentage(status)
      const threshold = status.student_count < 20 ? 60 : 80
      if (percentage >= threshold) return 'green'
      if (percentage > 0) return 'orange'
      return 'red'
    },
    getTotalSubmitStatusText(status) {
      const percentage = this.calculateTotalSubmitPercentage(status)
      const threshold = status.student_count < 20 ? 60 : 80
      if (percentage >= threshold) return '已提交'
      if (percentage > 0) return '提交中'
      return '未提交'
    },
    getTotalProgressStatus(status) {
      const percentage = this.calculateTotalSubmitPercentage(status)
      const threshold = status.student_count < 20 ? 60 : 80
      if (percentage === 0) return 'exception'
      if (percentage >= threshold) return 'success'
      return 'active'
    },
    calculateMinSubmittedCount(status) {
      // 找出所有权重不为0的分项
      const submittedCounts = []
      
      if (status.score_weights.regular > 0) {
        submittedCounts.push(status.regular_submitted_count || 0)
      }
      if (status.score_weights.midterm > 0) {
        submittedCounts.push(status.midterm_submitted_count || 0)
      }
      if (status.score_weights.practice > 0) {
        submittedCounts.push(status.practice_submitted_count || 0)
      }
      if (status.score_weights.final > 0) {
        submittedCounts.push(status.final_submitted_count || 0)
      }
      
      return submittedCounts.length > 0 ? Math.min(...submittedCounts) : 0
    },
    exportData() {
      // 准备表头和样式
      const headers = [
        '课程管理单位', '课程名称', '课程号', '班级', '班级号', 
        '教师姓名', '教师工号', '平时成绩比例', '期中成绩比例', 
        '期末成绩比例', '实践成绩比例', '平时成绩提交状态', 
        '期中成绩提交状态', '总评提交状态', '最后提交时间', '最后提交人'
      ]
      
      // 准备数据
      const data = [headers]
      this.rawData.forEach(item => {
        data.push([
          item.college.name,
          item.course.name,
          item.course.id,
          item.class_info.name,
          item.class_info.id,
          item.teacher.name,
          item.teacher.id,
          `${item.submission_status.score_weights.regular * 100}%`,
          `${item.submission_status.score_weights.midterm * 100}%`,
          `${item.submission_status.score_weights.final * 100}%`,
          `${item.submission_status.score_weights.practice * 100}%`,
          this.getSubmitStatusText(item.submission_status, 'regular'),
          this.getSubmitStatusText(item.submission_status, 'midterm'),
          this.getTotalSubmitStatusText(item.submission_status),
          item.submission_status.last_submit_time ? moment(item.submission_status.last_submit_time).format('YYYY-MM-DD HH:mm:ss') : '-',
          item.submission_status.last_submit_by || '-'
        ])
      })

      // 创建工作簿和工作表
      const wb = XLSX.utils.book_new()
      const ws = XLSX.utils.aoa_to_sheet(data)
      
      // 设置列宽
      ws['!cols'] = [
        { wch: 15 }, { wch: 30 }, { wch: 10 }, { wch: 15 }, { wch: 10 },
        { wch: 10 }, { wch: 10 }, { wch: 12 }, { wch: 12 }, { wch: 12 },
        { wch: 12 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 20 },
        { wch: 15 }
      ]

      // 添加工作表到工作簿
      XLSX.utils.book_append_sheet(wb, ws, '成绩提交情况')

      // 生成二进制数据
      const wbout = XLSX.write(wb, { 
        bookType: 'xlsx', 
        type: 'array' 
      })

      // 使用 file-saver 保存文件
      const blob = new Blob([wbout], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      })
      saveAs(blob, `成绩提交情况_${moment().format('YYYY-MM-DD_HHmmss')}.xlsx`)
    }
  },
  mounted () {
    this.fetchData()
  }
}
</script>

<style scoped>
.grade-submission-wrapper {
  background: #fff;
  padding: 24px;
}

.text-secondary {
  color: rgba(0, 0, 0, 0.45);
  font-size: 12px;
}

.mt-1 {
  margin-top: 4px;
}

.student-count {
  color: #1890ff;
  font-size: 12px;
  margin-top: 4px;
}

.score-weights {
  padding: 4px 0;
}

.weights-row {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-bottom: 4px;
}

.weight-item {
  text-align: center;
  margin: 0;
  min-width: 60px;
}

.total-row {
  font-size: 12px;
  color: rgba(0, 0, 0, 0.65);
  padding-top: 4px;
  border-top: 1px dashed #e8e8e8;
}

.error-text {
  color: #ff4d4f;
}

.ant-progress {
  margin-bottom: 4px;
  width: 70%;
}

.course-info {
  width: 100%;
  min-width: 0;
}

.course-name {
  display: block;
  width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
