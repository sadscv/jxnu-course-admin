export const dataManagerMixin = {
  methods: {
    showChangeList (changeList) {
      let flag = false
      changeList.forEach((change) => {
        if (change.type !== 'deleted-silent') {
          flag = true
        }
      })
      if (!flag) {
        return
      }
      const h = this.$createElement
      const list = [h('div', {
        'class': { 'conflict-list-hint': true }
      }, '以下课程被移出已选或待选列表，时间冲突的课程如有需要可重新选择。')]
      changeList.forEach((change) => {
        if (change.type === 'deleted-silent') {
          return
        }
        const newClassTime = change.type === 'conflicted' ? this.$store.state.allClassesMap[`${change['course_id']}-${change['teacher_id']}`]['class_time'] : null
        list.push(h('p', {
          'class': { 'conflict-list-class-meta': true }
        }, [
          h('b', change.type === 'conflicted' ? '变更后时间冲突：' : '移除：'),
          h('br'),
          `${change['course_name']} `,
          h('small', `(${change['course_id']})`),
          h('br'),
          `${change['teacher_name']} `,
          h('small', `(${change['teacher_id']})`),
          h('a-divider', {
            props: { type: 'vertical' }
          }),
          h('span', {
            'class': { 'conflict-list-class-meta-time': true }
          }, newClassTime == null || change['class_time'] === newClassTime ? change['class_time'] : `${change['class_time']} → ${newClassTime}`)
        ]))
      })
      this.$warning({
        title: '部分课程信息变更：',
        content: list,
        okText: '确定'
      })
    }
  }
}
