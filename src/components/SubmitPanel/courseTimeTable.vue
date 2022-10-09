<template>
  <a-table :data-source="tableData" :customRow="customRow" size="small" :showHeader="false" :pagination="false" >
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
          :loading="loading"
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
    <a-table-column key="input" title="Comment" data-index="index">
      <template v-slot="index">
        <a-input placeholder="备注" v-model="state[index].comment" @change="syncComment(state[index].comment, index)"/>
        {{ state[index].comment }}
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
    },
    loading: false,
    enable: {}
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
        weekDetail[key].loading = true
        weekDetail[key].tagList = {
          key: key,
          index: index,
          weekNum: weekDetail[key].weekNum,
          tags: weekDetail[key].tags
        }
        weekDetail[key].index = index
        weekDetail[key].comment = null
        stateObject[index] = {
          key: key,
          loading: false,
          index: index,
          inputVisible: false,
          inputValue: null,
          tags: weekDetail[key].tags,
          comment: null
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
      const weekData = this.tableData[index]
      if (weekData.oldClassroom !== weekData.newClassroom || weekData.tags.length > 0) {
        this.$emit('pushWeekChange', this.tableData)
      }
    },
    syncComment (value, index) {
      this.tableData[index].comment = value
      console.log(this.tableData[index].comment)
      // console.log(this.state[index].comment.value)
    },
    customRow (record, index) {
      if (!this.enable) {
        console.log(record, index)
        return {
          style: {
            // color: record.remarkDesc ? record.remarkDesc.fontColor : '#262626',
            'background-color': '#dcdcdc',
            'pointer-events': 'none'
          }
        }
      } else {
        return {
          style: {
            color: record.remarkDesc ? record.remarkDesc.fontColor : '#262626'
            // 'background-color': '#dcdcdc',
            // 'pointer-events': 'none'
          }
        }
      }
    }

  },
  watch: {
    tableData: {
      handler (newData) {
        this.$emit('syncCourseTime', this.tableData)
      },
      deep: true
    },
    weekDetail (val) {
      this.processWeekDetail(val)
    }
  }
})
</script>

<style scoped>
.disabled-row {
  background-color: #dcdcdc;
  pointer-events: none;
}
</style>
