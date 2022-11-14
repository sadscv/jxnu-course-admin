<template>
  <div>
    <a-table
      :data-source="tableData"
      :customRow="customRow"
      size="small"
      :showHeader="false"
      :pagination="false"
      :rowSelection="{ selectedRowKeys: selectedRowKeys, onChange: onSelectChange }"
    >
      <!--    <a-table-column key="firstName" title="first name" data-index="firstName">-->
      <!--      First Name-->
      <!--    </a-table-column>-->
      <a-table-column key="week" title="Last Name" data-index="week" />
      <a-table-column key="date" title="Date" data-index="date" />
      <a-table-column key="index" title="Action" data-index="index">
        <template v-slot="index" >
          <a-space>
            地点:
            <a-input
              size="default"
              :style="{ width: '130px' }"
              :loading="loading"
              @search="onChangeClassroom(index)"
              v-model="tableData[index].newClassroom"
              allow-clear >
            </a-input>
          </a-space>

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
            候补场地
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
      <a-table-column data-index="index">
        <template v-slot="index">
          <a-switch checked-children="线上" un-checked-children="线下" v-model:checked="state[index].online" @change="syncOnline(state[index].online, index)" />
        </template>
      </a-table-column>
      <a-table-column key="input" title="Comment" data-index="index">
        <template v-slot="index">
          <a-textarea :autoSize="{ minRows: 1, maxRows: 5}" :placeholder="state[index].online?'请填写线上教学入口':'备注' " v-model="state[index].comment" @change="syncComment(state[index].comment, index)"/>
        </template>
      </a-table-column>
    </a-table>
  </div>

</template>
<script>

export default ({
  components: {
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
      weekNum: null,
      state: {
      },
      selectedRowKeys: []
    }
  },
  created () {
    this.processWeekDetail = function () {
      const weekDetail = this.weekDetail
      const tableData = []
      const stateObject = {}
      let weekNum = null
      Object.keys(weekDetail).forEach(function (key, index) {
        weekDetail[key].index = index
        weekDetail[key].loading = true
        weekNum = weekDetail[key].weekNum
        weekDetail[key].tagList = {
          key: key,
          index: index,
          weekNum: weekDetail[key].weekNum,
          tags: weekDetail[key].tags
        }
        weekDetail[key].index = index
        stateObject[index] = {
          key: key,
          loading: false,
          index: index,
          inputVisible: false,
          inputValue: null,
          tags: weekDetail[key].tags,
          comment: weekDetail[key].comment,
          online: weekDetail[key].online,
          weekNum: weekDetail[key].weekNum
        }
        tableData.push(weekDetail[key])
      })
      this.tableData = tableData
      this.state = stateObject
      this.weekNum = weekNum
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
    },
    syncOnline (value, index) {
      this.tableData[index].online = value
      if (value) {
        this.$message.warn('特别提醒：非疫情等特殊原因不得申请线上教学！', 10)
      }
      console.log(this.tableData[index])
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
    },
    onSelectChange (selectedRowKeys, selectedRows) {
      this.selectedRowKeys = selectedRowKeys
      this.selectedRows = selectedRows
      this.$emit('onAdjustCourse', this.selectedRows, this.weekNum)
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
