<template>
  <a-table :data-source="tableData" size="small" :row-class-name="rowClassNameFn" :showHeader="false" :pagination="false" >
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
          enter-button="变更教室"
          v-model="tableData[index].newClassroom"
          allow-clear >
        </a-input-search>
      </template>
    </a-table-column>
    <a-table-column key="tags" title="Tags" data-index="tags">
      <template #default="tags">
        <a-input
          v-if="inputVisible"
          ref="inputRef"
          type="text"
          size="small"
          :style="{ width: '78px' }"
          v-model:value="inputValue"
          @blur="handleInputConfirm"
          @keyup.enter="handleInputConfirm"
        />
        <a-tag v-else @click="showInput" style="background: #fff; border-style: dashed">
          候补教室
          <plus-outlined />
        </a-tag>
        <span>
          <a-tag v-for="tag in tags" :key="tag" closable color="blue">{{ tag }}</a-tag>
        </span>
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
      test: null,
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
        console.log(key, weekDetail[key].index)
        tableData.push(weekDetail[key])
      })
      this.tableData = tableData
    }
    this.processWeekDetail()
  },
  props: {
    weekDetail: {
    }
  },
  watch: {
    tableData: {
      handler (newData) {
        this.$emit('syncCourseTime', this.tableData)
      },
      deep: true
    }
  },
  computed () {
  },
  setup () {
        const inputRef = ref()
    const state = reactive({
      tags: ['Unremovable', 'Tag 2', 'Tag 3Tag 3Tag 3Tag 3Tag 3Tag 3Tag 3'],
      inputVisible: false,
      inputValue: ''
    })

    const handleClose = removedTag => {
      const tags = state.tags.filter(tag => tag !== removedTag)
      console.log(tags)
      state.tags = tags
    }

    const showInput = () => {
      state.inputVisible = true
      nextTick(() => {
        inputRef.value.focus()
      })
    }

    const handleInputConfirm = () => {
      const inputValue = state.inputValue
      let tags = state.tags

      if (inputValue && tags.indexOf(inputValue) === -1) {
        tags = [...tags, inputValue]
      }

      console.log(tags)
      Object.assign(state, {
        tags,
        inputVisible: false,
        inputValue: ''
      })
    }

    return { ...toRefs(state), handleClose, showInput, handleInputConfirm, inputRef }
  },
  methods: {
    onChangeClassroom () {
      console.log('fuck')
    },
    rowClassNameFn (row, rowIndex) {
      row.index = rowIndex
    },
    getIndex (data) {
      return data.index
    }
  }

})
</script>
