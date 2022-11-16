<template>
  <a-modal
    title="新建规则"
    :width="640"
    :visible="visible"
    :confirmLoading="loading"
    @ok="() => { $emit('ok') }"
    @cancel="() => { $emit('cancel') }"
  >
    <a-spin :spinning="loading">
      <a-form :form="form" v-bind="formLayout">
        <a-form-item v-show="model && model.id > 0" label="主键ID">
          <a-input v-decorator="['id', { initialValue: 0 }]" disabled />
        </a-form-item>
        <a-form-item label="调停课业务号" style="display:none">
          <a-input v-decorator="['调停课业务号']" disabled />
        </a-form-item>
        <a-form-item label="调停课事由">
          <a-input v-decorator="['调停课事由']" />
          <!--          <a-input v-decorator="['description', {rules: [{required: true, min: 5, message: '请输入至少五个字符的规则描述！'}]}]" />-->
        </a-form-item>
        <a-form-item label="补课日期" >
          <a-date-picker v-decorator="['补课日期']" style="width: 100%" format="YYYY-MM-DD" placeholder="请选择补课日期"/>
        </a-form-item>
        <a-form-item label="补课时段">
          <a-input v-decorator="['补课时段描述']" placeholder="如 第12节 | 8:00-9:30"/>
        </a-form-item>
        <a-form-item label="补课地点">
          <a-input v-decorator="['补课地点描述']" />
        </a-form-item>
        <a-form-item label="备注">
          <a-input v-decorator="['备注']" />
        </a-form-item>
        <a-form-item label="调停课表信息" v-if="false"></a-form-item>
        <a-form-item label="调停课表">
          <a-upload
            v-decorator="['调停课表附件']"
            ref="uploader"
            action="/API/v1.0/upload_adjustment"
            list-type="text"
            :file-list="uploadFileList"
            :before-upload="beforeUpload"
            @change="handleChange"
          >
            <a-button>
              点击上传
            </a-button>
          </a-upload>
        </a-form-item>
      </a-form>
    </a-spin>
  </a-modal>
</template>

<script>
import pick from 'lodash.pick'

// 表单字段
const fields = ['description', 'id', '补课日期', '补课时段描述', '补课地点描述', '调停课表附件', '调停课表信息', '调停课事由', '备注']

export default {
  props: {
    visible: {
      type: Boolean,
      required: true
    },
    loading: {
      type: Boolean,
      default: () => false
    },
    model: {
      type: Object,
      default: () => null
    }
  },
  data () {
    this.formLayout = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 7 }
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 13 }
      }
    }
    return {
      // form: this.getFormValue()
      form: this.$form.createForm(this),
      uploadFileList: [],
      handleChange: (fileInfo) => {
        const adjustmentInfo = []
        console.log('fuck')
        const resFileList = [...fileInfo.fileList]
        this.form.getFieldDecorator('调停课表信息', { initialValue: '' })
        for (const key in resFileList) {
          const fileInfo = resFileList[key]
          if (fileInfo.hasOwnProperty('status') && fileInfo.status === 'done') {
            const info = {
              'name': fileInfo.name,
              'status': fileInfo.status
            }
            if (fileInfo.response && fileInfo.response.hasOwnProperty('url')) {
              fileInfo.url = fileInfo.response.url
              info.url = fileInfo.url
            } else {
              info.url = fileInfo.url
            }
            adjustmentInfo.push(info)
          }
          this.form.setFieldsValue({ '调停课表信息': adjustmentInfo })
          console.log(this.uploadFileList, this.form)
        }
        this.uploadFileList = resFileList
      }
    }
  },
  methods: {
    beforeUpload (file) {
      const { type, size } = file
      const limitType = type === 'image/jpeg' || type === 'image/png' || type === 'application/pdf'
      if (!limitType) {
          this.$message.error('请上传 JPG、PNG 格式图片或PDF文档!')
      }
      const limitSize = size / 1024 / 1024 < 10
      if (!limitSize) {
          this.$message.error('文件可大于 10MB!')
      }
      return limitType && limitSize
    },

    getFormValue () {
      const form = this.$form.createForm(this)
      console.log(form)
      return form
    }
  },
  created () {
    console.log('custom modal created')

    // 防止表单未注册
    fields.forEach(v => this.form.getFieldDecorator(v))

    // 当 model 发生改变时，为表单设置值
    this.$watch('model', () => {
      console.log('watchingmodel', this.model)
      this.model && this.form.setFieldsValue(pick(this.model, fields))
      const attachmentInfo = pick(this.model, fields)['调停课表附件']
      let attachments = []
      if (attachmentInfo) {
        attachments = JSON.parse(attachmentInfo)
        this.form.setFieldsValue({ '调停课表信息': attachments })
      } else {
        this.form.setFieldsValue({ '调停课表信息': [] })
      }
      this.uploadFileList = []
      for (const att in attachments) {
        attachments[att].uid = att
        this.uploadFileList.push(attachments[att])
      }
    })
  }
}
</script>
