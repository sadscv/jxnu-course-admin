<template>
  <div>
    <a-table
      :data-source="tableData"
      :customRow="customRow"
      size="small"
      :showHeader="isShowHeader()"
      :pagination="false"
    >
      <a-table-column data-index="index" title="调停课">
        <template v-slot="index" >
          <a-switch
            checked-children="调停"
            un-checked-children=""
            v-model:checked="state[index].adjusted"
            @change="syncAdjusted" />
        </template>
      </a-table-column>
      <a-table-column data-index="index" title="线上教学">
        <template v-slot="index">
          <a-switch checked-children="线上" un-checked-children="" v-model:checked="state[index].online" @change="syncOnline(state[index].online, index)" />
        </template>
      </a-table-column>
      <a-table-column key="week" title="星期" data-index="week" />
      <a-table-column key="date" title="节次" data-index="date" />
      <a-table-column key="index" title="地点" data-index="index">
        <template v-slot="index" >
          <a-space>
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
      <a-table-column key="tagList.key" title="候补场地" data-index="tagList">
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

      <a-table-column key="input" title="备注" data-index="index">
        <template v-slot="index">
          <a-textarea
            :autoSize="{ minRows: 1, maxRows: 5}"
            :placeholder="state[index].online?'请填写申请原因+线上教学入口':'备注' "
            v-model="state[index].comment"
            :style="state[index].online?{ width: '220px' }:{ width: '160px' }"
            @change="syncComment(state[index].comment, index)"/>
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
    enable: {},
    showHeader: {},
    loading: null
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
        weekNum = weekDetail[key].weekNum
        weekDetail[key].index = index
        weekDetail[key].loading = true
        weekDetail[key].tagList = {
          key: key,
          index: index,
          weekNum: weekDetail[key].weekNum,
          tags: weekDetail[key].tags
        }
        stateObject[index] = {
          key: key,
          index: index,
          loading: false,
          inputVisible: false,
          inputValue: null,
          tags: weekDetail[key].tags,
          comment: weekDetail[key].comment,
          online: weekDetail[key].online === '1',
          adjusted: weekDetail[key].adjusted,
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
    syncAdjusted (value, index) {
      this.tableData[index].adjusted = value
    },
    syncOnline (value, index) {
      this.tableData[index].online = value
      if (value) {
        this.$message.warn('特别提醒：未经教务处批准不得申请线上教学！', 10)
      }
      console.log(this.tableData[index])
    },
    isShowHeader () {
      return this.showHeader
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
