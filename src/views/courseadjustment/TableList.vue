<template>
  <page-header-wrapper :title="false">
    <a-card :bordered="false">
      <div class="table-page-search-wrapper">
        <a-form layout="inline">
          <a-row :gutter="48">
            <a-col :md="8" :sm="24">
              <a-form-item label="调停课编号">
                <a-input v-model="queryParam.id" placeholder=""/>
              </a-form-item>
            </a-col>
            <a-col :md="8" :sm="24">
              <a-form-item label="当前状态">
                <a-select v-model="queryParam.status" placeholder="请选择" default-value="0">
                  <a-select-option value="0">待上传调停课表</a-select-option>
                  <a-select-option value="1">待完善补课信息</a-select-option>
                  <a-select-option value="2">等候补课</a-select-option>
                  <a-select-option value="3">结束流程</a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
            <template v-if="advanced">
              <a-col :md="8" :sm="24">
                <a-form-item label="更新日期">
                  <a-date-picker v-model="queryParam.date" format="YY-MM-DD" style="width: 100%" placeholder="请输入更新日期"/>
                </a-form-item>
              </a-col>
            </template>
            <a-col :md="!advanced && 8 || 24" :sm="24">
              <span class="table-page-search-submitButtons" :style="advanced && { float: 'right', overflow: 'hidden' } || {} ">
                <a-button type="primary" @click="$refs.table.refresh(true)">查询</a-button>
                <a-button style="margin-left: 8px" @click="() => this.queryParam = {}">重置</a-button>
                <a @click="toggleAdvanced" style="margin-left: 8px">
                  {{ advanced ? '收起' : '展开' }}
                  <a-icon :type="advanced ? 'up' : 'down'"/>
                </a>
              </span>
            </a-col>
          </a-row>
        </a-form>
      </div>

      <div class="table-operator">
        <!--        <a-button type="primary" icon="plus" @click="handleAdd">测试</a-button>-->
        <a-dropdown v-action:edit v-if="selectedRowKeys.length > 100000">
          <a-menu slot="overlay">
            <a-menu-item key="1"><a-icon type="delete" />删除</a-menu-item>
            <!-- lock | unlock -->
            <a-menu-item key="2"><a-icon type="lock" />锁定</a-menu-item>
          </a-menu>
          <a-button style="margin-left: 8px">
            批量操作 <a-icon type="down" />
          </a-button>
        </a-dropdown>
      </div>

      <s-table
        ref="table"
        size="default"
        rowKey="key"
        :columns="columns"
        :data="loadData"
        :alert="true"
        :rowSelection="rowSelection"
        :showPagination="false"
      >
        <span slot="serial" slot-scope="text, record, index">
          {{ index + 1 }}
        </span>
        <span slot="status" slot-scope="text">
          <a-badge :status="parseInt(text) | statusTypeFilter" :text="parseInt(text)| statusFilter" />
        </span>
        <span slot="description" slot-scope="text">
          <ellipsis :length="4" tooltip>{{ text }}</ellipsis>
        </span>
        <span slot="date" slot-scope="date">
          {{ date && new Date(date).toLocaleDateString() }}
        </span>
        <span slot="datetime" slot-scope="date" >
          <ellipsis :length="110" tooltip>
            {{ date && new Date(date).toISOString().substring(0, 16) }}
          </ellipsis>
        </span>
        <span slot="action" slot-scope="text, record">
          <template>
            <a @click="handleEdit(record)">编辑</a>
            <a-divider type="vertical" />
<!--            <a @click="handleSub(record)">测试</a>-->
          </template>
        </span>
      </s-table>

      <create-form
        ref="createModal"
        :visible="visible"
        :loading="confirmLoading"
        :model="mdl"
        @cancel="handleCancel"
        @ok="handleOk"
      />
      <step-by-step-modal ref="modal" @ok="handleOk"/>
    </a-card>
  </page-header-wrapper>
</template>

<script>
import moment from 'moment'
import { STable, Ellipsis } from '@/components'
import { getRoleList, updateAdjustmentInfo } from '@/api/manage'
import { getAdjustmentList } from '@/api/course'

import StepByStepModal from './modules/StepByStepModal'
import CreateForm from './modules/CreateForm'

const columns = [
  {
    title: '#',
    dataIndex: 'id',
    scopedSlots: { customRender: 'serial' }
  },
  {
    title: '课程管理单位',
    dataIndex: '课程管理单位',
    sorter: (a, b) => {
      const a1 = a.课程管理单位
      const b1 = b.课程管理单位
      return a1.localeCompare(b1)
    }
    // scopedSlots: { customRender: 'description' }
    // customRender: (text) => text + ' 次',
    // needTotal: true,
  },
  {
    title: '任课教师',
    dataIndex: '任课教师'
  },
  {
    title: '课程名称',
    dataIndex: '课程名称标识'
  },
  {
    title: '班级名称',
    dataIndex: '班级名称'
  },
  {
    title: '原上课时间',
    width: '200px',
    dataIndex: '调停课时间'
  },
  {
    title: '补课日期',
    dataIndex: '补课日期',
    scopedSlots: { customRender: 'date' },
    key: '补课日期',
    sortField: '补课日期',
    sorter: (a, b) => {
      const a1 = new Date(a.补课日期).getTime()
      const b1 = new Date(b.补课日期).getTime()
      return a1 - b1
    }
  },
  {
    title: '补课地点',
    dataIndex: '补课地点描述'
  },
  {
    title: '当前状态',
    width: '120px',
    dataIndex: '审核状态',
    scopedSlots: { customRender: 'status' },
    key: '审核状态',
    sortField: '审核状态',
    sorter: (a, b) => {
      const a1 = a.审核状态
      const b1 = b.审核状态
      return a1.localeCompare(b1)
    }
  },
  {
    title: '更新时间',
    width: '100px',
    dataIndex: '最后修改时间',
    key: '最后修改时间',
    sortField: '最后修改时间',
    defaultSortOrder: 'descend',
    scopedSlots: { customRender: 'datetime' },
    sorter: (a, b) => {
      const a1 = new Date(a.最后修改时间).getTime()
      const b1 = new Date(b.最后修改时间).getTime()
      if (!a1 && b1) {
        return 1
      } else if (!a1 && !b1) {
        return 0
      } else if (a1 && !b1) {
        return -1
      }
      return a1 - b1
    }

  },
  {
    title: '操作',
    dataIndex: 'action',
    width: '150px',
    scopedSlots: { customRender: 'action' }
  }
]

const statusMap = {
  0: {
    status: 'error',
    text: '待上传调停课表'
  },
  1: {
    status: 'processing',
    text: '待完善补课信息'
  },
  2: {
    status: 'success',
    text: '等候补课'
  },
  3: {
    status: 'default',
    text: '结束流程'
  }
}

export default {
  name: 'TableList',
  components: {
    STable,
    Ellipsis,
    CreateForm,
    StepByStepModal
  },
  data () {
    this.columns = columns
    return {
      // create model
      visible: false,
      confirmLoading: false,
      mdl: null,
      // 高级搜索 展开/关闭
      advanced: false,
      // 查询参数
      queryParam: {},
      // 加载数据方法 必须为 Promise 对象
      loadData: parameter => {
        const requestParameters = Object.assign({}, parameter, this.queryParam)
        console.log('loadData request parameters:', requestParameters)
        return getAdjustmentList(requestParameters)
          .then(res => {
            console.log(res)
            return res
          })
      },
      selectedRowKeys: [],
      selectedRows: []
    }
  },
  filters: {
    statusFilter (type) {
      return statusMap[type].text
    },
    statusTypeFilter (type) {
      return statusMap[type].status
    }
  },
  created () {
    getRoleList({ t: new Date() })
  },
  computed: {
    rowSelection () {
      return {
        selectedRowKeys: this.selectedRowKeys,
        onChange: this.onSelectChange
      }
    }
  },
  methods: {
    handleAdd () {
      this.mdl = null
      this.visible = true
    },
    handleEdit (record) {
      this.visible = true
      this.mdl = { ...record }
    },
    handleOk () {
      const form = this.$refs.createModal.form
      this.confirmLoading = true
      form.validateFields((errors, values) => {
        if (!errors) {
          console.log('values', values)
          if (values.id) {
            // 修改 e.g.
            // new Promise((resolve, reject) => {
            //   // setTimeout(() => {
            //   //   resolve()
            //   // }, 1000)
            //
            // })
            updateAdjustmentInfo(values).then(res => {
              this.visible = false
              this.confirmLoading = false
              // 重置表单数据
              form.resetFields()
              // 刷新表格
              this.$refs.table.refresh()

              this.$message.info('修改成功')
            })
          } else {
            this.$message.error('修改失败,请重试')
            form.resetFields()
            this.visible = false
            this.confirmLoading = false
          }
        } else {
          this.confirmLoading = false
        }
      })
    },
    handleCancel () {
      this.visible = false

      const form = this.$refs.createModal.form
      form.resetFields() // 清理表单数据（可不做）
    },
    handleSub (record) {
      if (record.status !== 0) {
        this.$message.info(`${record.no} 订阅成功`)
      } else {
        this.$message.error(`${record.no} 订阅失败，规则已关闭`)
      }
    },
    onSelectChange (selectedRowKeys, selectedRows) {
      this.selectedRowKeys = selectedRowKeys
      this.selectedRows = selectedRows
    },
    toggleAdvanced () {
      this.advanced = !this.advanced
    },
    resetSearchForm () {
      this.queryParam = {
        date: moment(new Date())
      }
    }
  }
}
</script>
