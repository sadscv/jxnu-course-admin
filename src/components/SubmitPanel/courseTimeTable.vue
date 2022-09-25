<template>
  <a-table :data-source="tableData" size="small" :showHeader="false" :pagination="false" >
    <a-table-column key="firstName" title="first name" data-index="firstName">
      First Name
    </a-table-column>
    <a-table-column key="week" title="Last Name" data-index="week" />
    <a-table-column key="date" title="Date" data-index="date" />
    <a-table-column key="oldClassroom" title="教室" data-index="oldClassroom" />

    <a-table-column key="index" title="Action" data-index="index">
      <template v-slot="index" >
        <a-input-search
          size="default"
          :style="{ width: '200px' }"
          enter-button="变更教室"
          v-model="tableData[index].newClassroom"
          allow-clear >
        </a-input-search>
      </template>
    </a-table-column>
    <a-table-column key="tagList.key" title="Tags" data-index="tagList" >
      <template v-slot="tagList">
        <div v-model:tagList="tableData[tagList.index].tagList">
          <a-input
            v-if="tagList.showInput"
            ref="inputRef"
            type="text"
            size="small"
            :style="{ width: '78px' }"
            @blur="handleInputConfirm"
            @keyup.enter="handleInputConfirm"
          />

          <!--        <span>-->
          <!--          <a-tag v-for="tag in tags" :key="tag" closable color="blue">{{ tag }}</a-tag>-->
          <!--        </span>-->
          <a-tag v-else @click="function (tagList) {tagList.showInput=true}" style="background: #fff; border-style: dashed">
            <a-icon type="plus-circle" />
            候补教室
            <!--          <plus-outlined />-->
          </a-tag>
        </div>

      </template>
    </a-table-column>
  </a-table>
</template>
<script>

import InputTag from '@/components/SubmitPanel/InputTag'
export default ({
  components: {
    InputTag
  },
  props: {
    weekDetail: {
    }
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
      const weekDetail = this.weekDetail
      const tableData = []
      Object.keys(weekDetail).forEach(function (key, index) {
        weekDetail[key].index = index
        weekDetail[key].inputShow = true
        weekDetail[key].tagList = {
          key: key,
          index: index,
          weekIndex: weekDetail[key].weekIndex,
          tags: weekDetail[key].tags,
          showInput: false
        }
        tableData.push(weekDetail[key])
      })
      this.tableData = tableData
    }
    this.processWeekDetail()
  },
  methods: {
    testInput (tagList) {
      console.log('fuck', tagList)
      tagList.showInput = true
      console.log(this.tableData[tagList.index].tagList)
      this.$set(this.tableData[tagList.index].tagList, 'showInput', false)
      console.log()
    }
  },
  watch: {
    tableData: {
      handler (newData) {
        this.$emit('syncCourseTime', this.tableData)
      },
      deep: true
    }
  }
})
</script>
