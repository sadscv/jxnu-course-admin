<template>
  <global-footer class="footer custom-render">
    <template v-slot:links>
      Copyright &copy; {{ new Date().getFullYear() }} <a href="https://github.com/sadscv" target="_blank">sadscv
      </a>.
      All Rights Reserved.
    </template>
    <template v-slot:copyright>
      数据来源: <a href="http://jwc.jxnu.edu.cn/" target="_blank">江西师范大学</a> 版权归江西师范大学所有
    </template>
    <div>
      Copyright &copy; {{ new Date().getFullYear() }} <a href="https://github.com/sadscv" target="_blank">sadscv
      </a>.
      All Rights Reserved.
    </div>
  </global-footer>
</template>

<script>
import { GlobalFooter } from '@ant-design-vue/pro-layout'

export default {
  name: 'ProGlobalFooter',
  components: {
    GlobalFooter
  }
}
</script>
