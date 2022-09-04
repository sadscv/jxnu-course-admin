<template>
  <a-table :data-source="rawData" size="small" :showHeader="false" :pagination="false" >
    <a-table-column key="firstName" title="first name" data-index="firstName">
      First Name
    </a-table-column>
    <a-table-column key="lastName" title="Last Name" data-index="lastName" />
    <a-table-column key="age" title="Age" data-index="age" />
    <a-table-column key="address" title="Address" data-index="address" />
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
          <plus-outlined />
          New Tag
        </a-tag>
        <span>
          <a-tag v-for="tag in tags" :key="tag" closable color="blue">{{ tag }}</a-tag>
        </span>
      </template>
    </a-table-column>
    <a-table-column key="action" title="Action">
      <template #default="record ">
        <a-input-search size="middle" enter-button="变更教室" allow-clear @search="onChangeClassroom">
        </a-input-search>
      </template>
    </a-table-column>
  </a-table>
</template>
<script>
import { DownOutlined } from '@ant-design/icons-vue'

const columns = [
  {
    title: 'Name',
    dataIndex: 'name',
    slots: {
      customRender: 'name'
    }
  },
  {
    title: 'Age',
    dataIndex: 'age'
  },
  {
    title: 'Address',
    dataIndex: 'address'
  }
]

const rawdata = [
  {
    key: '1',
    firstName: 'John',
    lastName: 'Brown',
    age: 32,
    address: 'New York No. 1 Lake Park',
    tags: ['nice', 'developer']
  },
  {
    key: '2',
    firstName: 'Jim',
    lastName: 'Green',
    age: 42,
    address: 'London No. 1 Lake Park',
    tags: ['loser']
  },
  {
    key: '3',
    firstName: 'Joe',
    lastName: 'Black',
    age: 32,
    address: 'Sidney No. 1 Lake Park',
    tags: ['cool', 'teacher']
  }
]

export default ({
  components: {
    DownOutlined
  },
  data () {
    return {
      pagination: false,
      rawData: rawdata,
      columns: columns,
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
  computed () {}

})
</script>
