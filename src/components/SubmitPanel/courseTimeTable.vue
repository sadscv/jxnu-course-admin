<template>
  <a-table :data-source="tableData" size="small" :showHeader="false" :pagination="false" >
    <a-table-column key="firstName" title="first name" data-index="firstName">
      First Name
    </a-table-column>
    <a-table-column key="week" title="Last Name" data-index="week" />
    <a-table-column key="date" title="Date" data-index="date" />
    <!--    <a-table-column key="oldClassroom" title="教室" data-index="oldClassroom">-->
    <!--      <template v-slot="oldClassroom">-->
    <!--        原教室: <b>{{oldClassroom}}</b>-->
    <!--      </template>-->
    <!--    </a-table-column>-->

    <a-table-column key="index" title="Action" data-index="index">
      <template v-slot="index" >
        <a-input-search
          size="default"
          :style="{ width: '200px' }"
          enter-button="变更教室"
          @search="onChangeClassroom(index)"
          v-model="tableData[index].newClassroom"
          allow-clear >
        </a-input-search>
      </template>
    </a-table-column>
    <a-table-column key="tagList.key" title="Tags" data-index="tagList" >
      <template v-slot="tagList">
        <a-input
          ref="`input-`+tagList.index"
          v-if="state[tagList.index].inputVisible"
          type="text"
          size="small"
          v-model="state[tagList.index].inputValue"
          :style="{ width: '78px' }"
          @blur="handleInputConfirm(tagList.index)"
          @keyup.enter="handleInputConfirm(tagList.index)"
          allow-clear
        />
        <a-tag v-else @click="showInput(tagList.index)" style="background: #fff; border-style: dashed">
          <a-icon type="plus-circle" />
          候补教室
          <!--          <plus-outlined />-->
        </a-tag>
        <span>
          <a-tag
            v-for="tag in state[tagList.index].tags"
            :visible="true"
            :key="tag"
            closable
            @close="handleClose(tag, tagList.index)"
            color="blue">
            {{ tag }}
          </a-tag>
        </span>

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
      state: {
      }
    }
  },
  created () {
    this.processWeekDetail = function () {
      const weekDetail = this.weekDetail
      const tableData = []
      const stateObject = {}
      Object.keys(weekDetail).forEach(function (key, index) {
        weekDetail[key].index = index
        weekDetail[key].tagList = {
          key: key,
          index: index,
          weekIndex: weekDetail[key].weekIndex,
          tags: weekDetail[key].tags
        }
        stateObject[index] = {
          key: key,
          index: index,
          inputVisible: false,
          inputValue: null,
          tags: weekDetail[key].tags
        }
        tableData.push(weekDetail[key])
      })
      this.tableData = tableData
      this.state = stateObject
    }
    this.processWeekDetail()
  },
  methods: {
    showInput (index) {
      this.state[index].inputVisible = true
    },
    handleInputConfirm (index) {
      if (this.state[index].inputValue && this.tableData[index].tags.indexOf(this.state[index].inputValue) === -1) {
        this.state[index].tags = [...this.tableData[index].tags, this.state[index].inputValue]
        this.tableData[index].tags = this.state[index].tags
      }
      this.state[index].inputVisible = false
    },
    handleClose (tag, index) {
      const count = Array.from(this.tableData[index].tags).indexOf(tag)
      console.log(count)
      this.tableData[index].tags.splice(count, 1)
    },
    onChangeClassroom (index) {
      console.log('change', this.tableData[index])
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
