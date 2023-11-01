<template>
  <a-space>
    <a-checkbox-group layout="inline" v-model="timeslotValue" name="checkboxgroup" :options="courseTimeOptions"></a-checkbox-group>
    <a-button
      :disabled="this.timeslotValue.length === 0"
      @click="updateAvailableClassroom(timeslotValue)"
      :loading="loading"
      v-if="timeslotButtonOn"
    >
      <span v-if="this.timeslotValue.length === 0" >
        选择时段
      </span>
      <span v-else>
        查询空闲教室
      </span>

    </a-button>
    <hr/>
    <a-space
      v-if="this.options.length > 0 && this.timeslotValue.length > 0"
      class="replace-classroom-selector"
    >
      <a-cascader
        v-model="value"
        :options="options"
        :show-search="{ filter }"
        placeholder="请选择"
      />
      <a-button type="danger" @click="submitClassroomSwap()">更换教室</a-button>
    </a-space>
    <a-divider/>
  </a-space>
</template>

<script>
import {
  getAllClassroomList,
  replaceClassroom
} from '@/api/manage'

export default ({
  name: 'SwapClassroomPanel',
  props: {
    weekDetail: {
    }
  },
  computed: {
    courseTimeOptions () {
      const timeList = []
      Object.keys(this.weekDetail).forEach((key) => {
        const slot = this.weekDetail[key]
        timeList.push({
          'label': slot['week'] + slot['date'] + ' ' + slot['oldClassroom'],
          'value': slot['key']
        })
      })
      return timeList
    }
  },
  data () {
    return {
      timeslotValue: [],
      value: [],
      loading: false,
      data: [],
      options: [],
      timeslotButtonOn: true
    }
  },
  methods: {
    filter (inputValue, path) {
      return path.some(option => option.label.toLowerCase().indexOf(inputValue.toLowerCase()) > -1)
    },
    updateAvailableClassroom (timeslot) {
      this.loading = true
      const params = {
        'stu_id': null
        }
      const emptySlot = timeslot.map((slot) => parseInt(slot.at(0)) * 7 + parseInt(slot.at(1)) - 8)
      const optionArray = []
      getAllClassroomList(params).then(res => {
        if (res && res.hasOwnProperty('used_classrooms')) {
          for (const c in res.used_classrooms) {
            let _continue = false
            emptySlot.forEach((slot) => {
              const usage = res.used_classrooms[c].usage
              if (usage.at(slot)) {
                _continue = true
              }
              if (res.used_classrooms[c].capacity === 0) {
                _continue = true
              }
              if (c === 'W5307') {
                console.log(usage, _continue, c, slot, emptySlot)
              }
            })
            if (_continue) {
              continue
            }
            const buildingName = res.used_classrooms[c].building
            const index = optionArray.findIndex(item => item.value === buildingName)
            if (index >= 0) {
              optionArray[index]['children'].push({
                value: c,
                label: c.trim() + '【' + res.used_classrooms[c].capacity.toString() + '座】',
                capacity: res.used_classrooms[c].capacity,
                type: res.used_classrooms[c].type
              })
            } else {
              optionArray.push({
                'value': buildingName,
                'label': buildingName,
                'children': [
                  {
                    value: c,
                    label: c.trim() + '【' + res.used_classrooms[c].capacity.toString() + '座】',
                    capacity: res.used_classrooms[c].capacity,
                    type: res.used_classrooms[c].type
                  }
                ]
              })
            }
          }
        }
        this.options = optionArray
        this.loading = false
        this.timeslotButtonOn = false
      }).finally()
    },
    submitClassroomSwap () {
      this.loading = true
      const ts0 = this.timeslotValue[0]
      const courseId = this.weekDetail[ts0]['courseId']
      const classId = this.weekDetail[ts0]['classId']

      const params = {
        'newClassroom': this.value,
        'timeslot': this.timeslotValue,
        'courseId': courseId,
        'classId': classId
      }
      replaceClassroom(params).then((res) => {
        this.$message.info(res, 10)
        this.loading = false
        this.$emit('onReplaceClassroomFinished')
      }
      ).finally()
    }
  }
})
</script>

<style>
.course-time-table {
}
.replace-classroom-selector {
  width: 300px;
}
.replace-classroom-table {
  display: inline;
}
</style>
