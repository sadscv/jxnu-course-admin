
  <a-modal
    title="新建规则"
    :width="640"
    :visible="visible"
    :confirmLoading="loading"
    @ok="handleOk"
    @cancel="() => { $emit('cancel') }"
  >
    <a-spin :spinning="loading">
      <a-form :form="form" v-bind="formLayout">
        <!-- 其他表单项 -->

        <a-form-item label="调停课表">
          <a-upload
            v-decorator="['调停课表附件']"
            ref="uploader"
            action="/API/v1.0/upload_adjustment"
            list-type="text"
            :file-list="uploadFileList"
            :before-upload="beforeUpload"
            :onPreview="handlePreview"
            @change="handleChange"
          >
            <a-button>点击上传</a-button>
          </a-upload>
        </a-form-item>

        <!-- 其他表单项 -->
      </a-form>
    </a-spin>
  </a-modal>
</template>

<script>
import pick from 'lodash.pick'

const fields = ['description', 'id', '补课日期', '补课时段描述', '补课地点描述', '调停课表附件', '调停课事由', '备注']

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
    return {
      formLayout: {
        labelCol: {
          xs: { span: 24 },
          sm: { span: 7 }
        },
        wrapperCol: {
          xs: { span: 24 },
          sm: { span: 13 }
        }
      },
      options: [
        {
          value: 'test',
          label: 'option1',
          children: [
            {
              value: 'child_1',
              label: 'child_1'
            }
          ]
        }
      ],
      form: this.$form.createForm(this),
      uploadFileList: []
    }
  },
  methods: {
    beforeUpload (file) {
      const { type, size } = file
      const limitType = type === 'image/jpeg' || type === 'image/png' || type === 'application/pdf'
      if (!limitType) {
        this.$message.error('请上传 JPG、PNG 格式图片或 PDF 文档!')
      }
      const limitSize = size / 1024 / 1024 < 10
      if (!limitSize) {
        this.$message.error('文件不可大于 10MB!')
      }
      return limitType && limitSize
    },
    handleChange (fileInfo) {
      const adjustmentInfo = []
      const resFileList = [...fileInfo.fileList]
      this.form.getFieldDecorator('调停课表信息', { initialValue: '' })
      for (const key in resFileList) {
        const file = resFileList[key]
        if (file.status === 'done') {
          const info = {
            name: file.name,
            status: file.status,
            url: file.response && file.response.url ? file.response.url : file.url
          }
          adjustmentInfo.push(info)
        }
      }
      this.form.setFieldsValue({ '调停课表信息': adjustmentInfo })
      this.uploadFileList = resFileList
    },
    handlePreview (file) {
      if (file.url) {
        if (file.name.endsWith('.pdf')) {
          // 如果是 PDF 文件，直接下载
          this.downloadFile(file.url, file.name)
        } else {
          // 如果不是 PDF 文件，继续使用默认行为
          window.open(file.url, '_blank')
        }
      }
    },
    downloadFile (url, filename) {
      // 创建一个临时的链接元素用于触发下载
      const link = document.createElement('a')
      link.href = url
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    },
    handleOk () {
      this.form.validateFields((err, values) => {
        if (!err) {
          this.$emit('ok', values)
        }
      })
    }
  },
  created () {
    fields.forEach(v => this.form.getFieldDecorator(v))
    this.$watch('model', () => {
      if (this.model) {
        this.form.setFieldsValue(pick(this.model, fields))
        const attachmentInfo = pick(this.model, fields)['调停课表附件']
        const attachments = attachmentInfo ? JSON.parse(attachmentInfo) : []
        this.form.setFieldsValue({ '调停课表信息': attachments })
        this.uploadFileList = attachments.map((att, index) => ({ ...att, uid: index }))
      }
    })
  }
}
</script>

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
            :onPreview="handlePreview"
            @change="handleChange"
          >
            <a-button>点击上传</a-button>
          </a-upload>
        </a-form-item>
        <a-form-item label="调停课类别">
          <a-dropdown>
            <a-cascader
              v-model="value"
              :options="options"
              :show-search="{ filter }"
              placeholder="请选择"
            />
            <a-select>
              <a-select-option value="123">345</a-select-option>
              <a-select-option value="1234">3456</a-select-option>
            </a-select>
          </a-dropdown>
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
      },
      options: [
        {
          value: 'test',
          label: 'option1',
          children: [
            {
              value: 'child_1',
              label: 'child_1'
            }
          ]
        },
        {
          value: 'test',
          label: 'option1',
          children: [
            {
              value: 'child_1',
              label: 'child_1'
            }
          ]
        }
      ]
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
    handlePreview (file) {
      if (file.url) {
        if (file.name.endsWith('.pdf')) {
          // 如果是 PDF 文件，直接下载
          this.downloadFile(file.url, file.name)
        } else {
          // 如果不是 PDF 文件，继续使用默认行为
          window.open(file.url, '_blank')
        }
      }
    },
    downloadFile (url, filename) {
      // 创建一个临时的链接元素用于触发下载
      const link = document.createElement('a')
      link.href = url
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    },
    handleOk () {
      this.form.validateFields((err, values) => {
        if (!err) {
          this.$emit('ok', values)
        }
      })
    },

    getFormValue () {
      const form = this.$form.createForm(this)
      console.log(form)
      return form
    },
    renderUploadItem (file) {
    if (file.status === 'done' && file.type === 'application/pdf') {
      // 如果文件是 PDF 类型，则设置为下载模式
      return (
        <a-list-item>
          <a href={file.url} download target="_blank" rel="noopener noreferrer">
            {file.name}
          </a>
        </a-list-item>
      )
    } else {
      // 非 PDF 文件保持正常展示
      return (
        <a-list-item>
          <a href={file.url} target="_blank" rel="noopener noreferrer">
            {file.name}
          </a>
        </a-list-item>
      )
    }
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
