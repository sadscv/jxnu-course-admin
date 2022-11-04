<template>
  <div class="lookup-panel-wrapper">
    <!--suppress JSUnusedGlobalSymbols -->
    <TableList/>
  </div>
</template>

<script>
  import TableList from './TableList'
  import NumberCapacity from './NumberCapacity'
  import ATableColumn from 'ant-design-vue/es/table/Column'
  import PopupPanel from '@/components/SubmitPanel/PopupPanel'

  export default {
    name: 'LookupPanel',
    components: {
        ATableColumn,
      NumberCapacity,
      TableList,
      PopupPanel
    },
    created () {
      this.$nextTick(() => {
        // this.LoadAllCourses()
       })
    },
    methods: {
    getInfo (row) {
      return row
    }
    },
    mixins: []
  }

</script>

<style scoped>
  .lookup-panel-wrapper {
    padding-top: 16px;
  }

  /*noinspection CssUnusedSymbol*/
  .table >>> .ant-table-pagination {
    margin-left: 16px;
    margin-right: 16px;
  }

  .table >>> .ant-table-thead th {
    white-space: nowrap;
  }

  /*noinspection CssUnusedSymbol*/
  .table >>> .ant-table-thead th, .table >>> .ant-table-row td {
    padding: 12px;
  }

  /*noinspection CssUnusedSymbol*/
  .table >>> .ant-table-thead th:first-child, .table >>> .ant-table-row td:first-child {
    padding-left: 16px;
  }

  .credit-badge {
    position: relative;
    margin-left: 7px;
    top: -1px;
  }

  /*noinspection CssUnusedSymbol*/
  .credit-badge >>> .ant-badge-count {
    background: white;
    color: #999999;
    box-shadow: 0 0 0 1px #d9d9d9 inset;
  }

  .id-info {
    color: rgba(0, 0, 0, 0.35);
    font-size: 12px;
  }

  .teacher-id-info {
    display: inline-block;
    width: 60px;
  }

  .conflict-info {
    display: inline-block;
    padding-bottom: 2px;
    font-size: 12px;
    color: rgba(244, 67, 54, 0.8);
  }

  .selected-info {
    display: inline-block;
    padding-bottom: 2px;
    font-size: 12px;
    color: #52c41a;
  }

  .limitation-tag {
    margin-top: 2px;
  }

  .detail-venue {
    color: rgba(0, 0, 0, 0.35);
    text-overflow: ellipsis;
    vertical-align: middle;
    display: inline-block;
    white-space: nowrap;
    overflow: hidden;
    font-size: 12px;
    width: 60px;
  }

  /*noinspection CssUnusedSymbol*/
  .table >>> .ant-table-row:hover .detail-venue {
    white-space: inherit;
  }

  /*noinspection CssUnusedSymbol*/
  .table >>> .ant-pagination.ant-table-pagination:first-child {
    margin-top: 0;
  }

  .about-data-wrapper {
    text-align: right;
  }

  .about-data {
    line-height: 2;
  }

  .course-intro-link {
    border-bottom: 1px solid transparent;
    color: rgba(0, 0, 0, 0.65);
    text-decoration: none;
    padding-bottom: 2px;
    line-height: 24px;
  }

  /*noinspection CssUnusedSymbol*/
  .course-intro-link:focus, .table >>> .ant-table-row:hover .course-intro-link {
    border-bottom: 1px dotted rgba(0, 0, 0, 0.35);
  }

  .course-intro-link:hover {
    color: #64B5F6;
  }

  .course-intro-link:active {
    color: #1976D2;
  }
</style>
