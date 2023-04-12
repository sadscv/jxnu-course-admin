<template>
  <page-header-wrapper :title="false">
    <div class="lookup-panel-wrapper">
      <LookupConditions ref="conditions" @filter="countdown(300, true)" />
      <!--suppress JSUnusedGlobalSymbols -->
      <a-table
        ref="table"
        class="table"
        :loading="this.tableLoading"
        :data-source="rows"
        :locale="{emptyText: '没有匹配的记录'}"
        :pagination="{position: 'both', showTotal: total => `${total} 条记录`}"
      >
        <a-table-column title="管理单位" data-index="college">
          <template v-slot="college">
            <a target="_blank" rel="external nofollow">
              <strong>{{ college }}</strong>
            </a>
          </template>
        </a-table-column>

        <a-table-column title="课程" data-index="course">
          <template v-slot="course">
            <a target="_blank" rel="external nofollow">
              <strong>{{ course.name }}</strong>
            </a>
            <a-badge maxlength="10" class="credit-badge" :count="`${course.credit}学分`" />
            <br />
            <small class="id-info">{{ course.id }}</small>
          </template>
        </a-table-column>
        <a-table-column title="班级" data-index="classes">
          <template v-slot="classes">
            <a>
              <strong>{{ classes.name }}</strong>
            </a>
            <br />
            <small class="id-info">{{ classes.id }}</small>
          </template>
        </a-table-column>
        <a-table-column title="教师" data-index="teacher">
          <template v-slot="teacher">
            <a>
              <strong>{{ teacher.name }}</strong>
            </a>
            <br /><small class="id-info teacher-id-info">{{ teacher.id }}</small>
          </template>
        </a-table-column>
        <a-table-column title="上课时间" data-index="class_time_info">
          <template v-slot="class_time_info">
            {{ class_time_info.row['class_time'].toString() }}
          </template>
        </a-table-column>

        <a-table-column title="地点" data-index="classroom">
          <template v-slot="classroom">
            {{ classroom.classroom_id.toString() }}
          </template>
        </a-table-column>
        <a-table-column title="备注" data-index="venue">
          <template v-slot="venue">
            <small class="detail-venue">无</small>
          </template>
        </a-table-column>
        <!--suppress HtmlDeprecatedAttribute -->
        <a-table-column data-index="action" width="1px">
          <div slot="title" class="about-data-wrapper">
            <a-popover placement="leftBottom">
              <div slot="content" class="about-data">
                * 仅限在教学时间不变情况下的教学场地调整报备<br />
                * <strong>教学时间变更请提交调停课申请表</strong>
              </div>
              <a-button size="small" type="link" icon="info-circle">说明</a-button>
            </a-popover>
          </div>
          <template v-slot="action">
            <PopupPanel
              :course-info="getInfo(action.row)"
              :default-week="getCourseWeek()"
            />
            <!--          <a-dropdown-button-->
            <!--            type="primary"-->
            <!--            :disabled="storageBusy"-->
            <!--            @click="updateCourseInfo(action.row, false)"-->
            <!--          >-->
            <!--          </a-dropdown-button>-->
          </template>
        </a-table-column>

      </a-table>

    </div>

  </page-header-wrapper>

</template>

<script>
  import LookupConditions from './LookupConditions'
  import NumberCapacity from './NumberCapacity'
  import { conflictSolvingMixin } from '@/mixins/common/conflictsSolver'
  import { LookupPanelMixin } from '@/mixins/LookupPanel'
  import { introductionOpenerMixin } from '@/mixins/common/introductionOpener'
  import ATableColumn from 'ant-design-vue/es/table/Column'
  import PopupPanel from '@/views/coursemanage/SubmitPanel/PopupPanel'

  export default {
    name: 'LookupPanel',
    components: {
        ATableColumn,
      NumberCapacity,
      LookupConditions,
      PopupPanel
    },
    created () {
      this.$nextTick(() => {
        this.updateData()
        this.LoadAllCourses()
       })
    },
    methods: {
    getInfo (row) {
      return row
    },
    getCourseWeek () {
      const state = JSON.parse(JSON.stringify(this.$store.state))
      return state.courseWeek
    },
    updateData: function () {
      // const hide = this.$message.loading('正在检查数据更新...', 0);
      this.$store.dispatch('checkUpdateAllInfos').then((data) => {
        if (data != null) {
        } else {
          this.$message.error('未获取到基础数据，请刷新页面重试！', 30)
        }
      }).catch(() => {
        this.$message.error('更新基础数据时出错，请刷新页面重试！', 30)
        this.$store.commit('LOADED', true)
      })
    }
    },
    mixins: [introductionOpenerMixin, conflictSolvingMixin, LookupPanelMixin]
  }

</script>

<style scoped>
  .lookup-panel-wrapper {
    padding-top: 0;
    padding-bottom: 0;
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
