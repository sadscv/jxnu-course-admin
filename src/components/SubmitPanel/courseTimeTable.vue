<template>
  <a-table :data-source="tableData" size="small" :row-class-name="rowClassNameFn" :showHeader="false" :pagination="false" >
    <a-table-column key="firstName" title="first name" data-index="firstName">
      First Name
    </a-table-column>
    <a-table-column key="week" title="Last Name" data-index="week" />
    <a-table-column key="date" title="Date" data-index="date" />
    <a-table-column key="oldClassroom" title="教室" data-index="oldClassroom" />
    <a-table-column key="tags" title="Tags" data-index="tags">
      <template #default="tags">
        <!--        <a-input-->
        <!--          v-if="inputVisible"-->
        <!--          ref="inputRef"-->
        <!--          type="text"-->
        <!--          size="small"-->
        <!--          :style="{ width: '78px' }"-->
        <!--          v-model:value="inputValue"-->
        <!--          @blur="handleInputConfirm"-->
        <!--          @keyup.enter="handleInputConfirm"-->
        <!--        />-->
        <!--        <a-tag v-else @click="showInput" style="background: #fff; border-style: dashed">-->
        <!--          <plus-outlined />-->
        <!--          New Tag-->
        <!--        </a-tag>-->
        <span>
          <a-tag v-for="tag in tags" :key="tag" closable color="blue">{{ tag }}</a-tag>
        </span>
      </template>
    </a-table-column>
    <a-table-column key="newClassroom" title="Action">
      <template #default="record " >
        <a-input-search
          size="default"
          enter-button="变更教室"
          placeholder="this.rawData[0]"
          v-model="key"
          allow-clear >
        </a-input-search>
      </template>
    </a-table-column>
  </a-table>
</template>
<script>

export default ({
  components: {
  },
  data () {
    return {
      pagination: false,
      tableData: null,
      rowSelection: {
      onChange: (selectedRowKeys, selectedRows) => {
        console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows)
      },
      getCheckboxProps: record => ({
        disabled: record.name === 'Disabled User',
        // Column configuration not to be checked
        name: record.name
      })
    }
    }
  },
  created () {
    this.processWeekDetail = function () {
      console.log(Object.values(this.weekDetail))
      this.tableData = Object.values(this.weekDetail)
      this.rawData = this.weekDetail
    }
    this.processWeekDetail()
  },
  props: {
    weekDetail: {
    }
  },
  watch: {
    tableData () {
      this.$emit('syncCourseTime', this.tableData)
      }
  },
  computed () {
  },
  methods: {
    onChangeClassroom () {
      console.log('fuck')
    },
    rowClassNameFn (row, rowIndex) {
      row.index = rowIndex
    }
  }

})
</script>
