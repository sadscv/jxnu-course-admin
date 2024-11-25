<template>
  <page-header-wrapper :title="false">
    <div class="grade-submission-wrapper">
      <LookupConditions ref="conditions" @filter="fetchData" />

      <a-table
        ref="table"
        class="table"
        :loading="tableLoading"
        :data-source="rows"
        :locale="{ emptyText: '没有匹配的记录' }"
        :pagination="{ position: 'both', showTotal: total => `${total} 条记录` }"
      >
        <!-- 课程基本信息 -->
        <a-table-column title="课程管理单位" data-index="course">
          <template v-slot="text, record">
            <strong>{{ record.college.name }}</strong>
            <br />
            <small class="id-info">{{ record.course.id }}</small>
          </template>
        </a-table-column>
        <a-table-column title="课程名称" data-index="course">
          <template v-slot="text, record">
            <strong>{{ record.course.name }}</strong>
            <br />
            <small class="id-info">{{ record.course.id }}</small>
          </template>
        </a-table-column>

        <a-table-column title="班级名称" data-index="class">
          <template v-slot="text, record">
            <strong>{{ record.class.name }}</strong>
            <br />
            <small class="id-info">{{ record.class.id }}</small>
          </template>
        </a-table-column>

        <a-table-column title="任课教师" data-index="teacher">
          <template v-slot="text, record">
            <strong>{{ record.teacher.name }}</strong>
            <br />
            <small class="id-info">{{ record.teacher.id }}</small>
          </template>
        </a-table-column>

        <!-- 设定成绩比例 -->
        <a-table-column title="设定成绩比例" data-index="gradeProportion">
          <template v-slot="text, record">
            <a-button type="primary" @click="openProportionModal(record)">设定比例</a-button>
          </template>
        </a-table-column>
      </a-table>

      <!-- 成绩比例设定模态框 -->
      <a-modal
        v-model="isModalVisible"
        title="设定成绩比例"
        @ok="handleProportionSubmit"
        @cancel="handleProportionCancel"
      >
        <a-form :form="form">
          <a-form-item label="平时成绩">
            <a-input-number
              v-decorator="['regularGrade', decoratorOptions]"
              :min="0"
              :max="1"
              :step="0.01"
            />
          </a-form-item>
          <a-form-item label="期中成绩">
            <a-input-number
              v-decorator="['midtermGrade', decoratorOptions]"
              :min="0"
              :max="1"
              :step="0.01"
            />
          </a-form-item>
          <a-form-item label="实践成绩">
            <a-input-number
              v-decorator="['practicalGrade', decoratorOptions]"
              :min="0"
              :max="1"
              :step="0.01"
            />
          </a-form-item>
          <a-form-item label="期末成绩">
            <a-input-number
              v-decorator="['finalGrade', decoratorOptions]"
              :min="0"
              :max="1"
              :step="0.01"
            />
          </a-form-item>
          <a-form-item>
            <div>总计：{{ totalProportion }}</div>
            <!--            <div v-if="totalProportion !== 1" style="color: red;">-->
            <!--              比例之和必须等于1！-->
            <!--            </div>-->
          </a-form-item>
        </a-form>
      </a-modal>
    </div>
  </page-header-wrapper>
</template>

<script>

import LookupConditionsMixin from './LookupConditions'

export default {
  name: 'GradeSubmission',
  components: {
    LookupConditionsMixin
  },
  data () {
    return {
      tableLoading: false,
      rows: [],
      isModalVisible: false,
      currentRecord: null,
      form: this.$form.createForm(this)
    }
  },
  computed: {
    totalProportion () {
      const { regularGrade, midtermGrade, practicalGrade, finalGrade } = this.form.getFieldsValue()
      return (
        (regularGrade || 0) +
        (midtermGrade || 0) +
        (practicalGrade || 0) +
        (finalGrade || 0)
      )
    },
    decoratorOptions () {
      return {
        rules: [{ required: true, message: '请输入比例' }],
        initialValue: 0
      }
    }
  },
  methods: {
    fetchData () {
      // 模拟获取数据
      this.tableLoading = true
      setTimeout(() => {
        this.rows = [
          {
            key: '1',
            college: { name: '计算机科学与技术学院' },
            course: { id: 'C001', name: '高等数学' },
            class: { id: 'CL001', name: '计算机科学1班' },
            teacher: { id: 'T001', name: '张老师' }
          }
          // 更多数据...
        ]
        this.tableLoading = false
      }, 1000)
    },
    openProportionModal (record) {
      this.currentRecord = record
      this.isModalVisible = true
      this.form.resetFields()
    },
    handleProportionSubmit () {
      if (this.totalProportion !== 1) {
        this.$message.error('比例之和必须等于1！')
        return
      }
      this.form.validateFields((err, values) => {
        if (!err) {
          // 提交数据
          console.log('提交的比例数据：', values)
          this.isModalVisible = false
        }
      })
    },
    handleProportionCancel () {
      this.isModalVisible = false
    }
  },
  mounted () {
    this.fetchData()
  }
}
</script>

<style scoped>
.grade-submission-wrapper {
  padding-top: 0;
  padding-bottom: 0;
}

.table >>> .ant-table-pagination {
  margin-left: 16px;
  margin-right: 16px;
}

.table >>> .ant-table-thead th {
  white-space: nowrap;
}

.table >>> .ant-table-thead th,
.table >>> .ant-table-row td {
  padding: 12px;
}

.table >>> .ant-table-thead th:first-child,
.table >>> .ant-table-row td:first-child {
  padding-left: 16px;
}

.id-info {
  color: rgba(0, 0, 0, 0.35);
  font-size: 12px;
}
</style>
