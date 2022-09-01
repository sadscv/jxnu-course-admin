<template>
  <a-table :row-selection="rowSelection" :columns="columns" :data-source="rawData" size="small" :pagination="false">
    <template #name="{ text }">
      <a>{{ text }}</a>
    </template>
  </a-table>
</template>
<script>
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
    name: 'John Brown',
    age: 32,
    address: 'New York No. 1 Lake Park'
  },
  {
    key: '2',
    name: 'Jim Green',
    age: 42,
    address: 'London No. 1 Lake Park'
  },
  {
    key: '3',
    name: 'Joe Black',
    age: 32,
    address: 'Sidney No. 1 Lake Park'
  },
  {
    key: '4',
    name: 'Disabled User',
    age: 99,
    address: 'Sidney No. 1 Lake Park'
  }
]
export default ({
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
