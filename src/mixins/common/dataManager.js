export const dataManagerMixin = {
  methods: {
    updateData () {
      this.$destroyAll()
      const hide = this.$message.loading('正在检查课程数据更新...', 0)
      this.$store.dispatch('updateFromNullStorage').then(() => {
        if (Object.keys(this.$store.state.reservedClasses).length === 0) {
          if (this.$refs.content != null) {
            this.$refs.content.activeTab = 'lookup'
          } else {
            this.activeTab = 'lookup'
          }
        }

        this.$store.dispatch('checkUpdateAllJXNUClasses').then((data) => {
          if (data != null) {
            const hide2 = this.$message.loading('正在更新课程数据...', 0)
            hide2()
            this.$store.dispatch('updateAllClassesFromFlask').then((changeList) => {
              if (this.$store.state.allCourses.length === 0) {
                this.$store.dispatch('updateAllCoursesInfo')
              } else {
                this.$store.dispatch('updateAllCoursesFromStorage')
              }
              this.$message.success('课程数据已更新！')
              this.$store.dispatch('selectAllFlaskClass')
              this.$store.dispatch('checkAllFlaskClass')

              if (changeList.length > 0) {
                this.showChangeList(changeList)
              }
            }).catch(() => {
              this.$message.error('更新课程数据时出错，请刷新页面重试！', 30)
            }).finally(() => {
              this.$store.dispatch('updateAllClassesExtra')
              this.$store.commit('LOADED', true)
            })
          } else {
            this.$store.dispatch('updateAllClassesExtra')
            this.$store.commit('LOADED', true)
          }
        }).catch(() => {
          this.$message.error('更新课程数据时出错，请刷新页面重试！', 30)
          this.$store.dispatch('updateAllClassesExtra')
          this.$store.commit('LOADED', true)
        }).finally(() => {
          hide()
        })

        // this.$store.dispatch('checkUpdateAllClasses').then((data) => {
        //   if (data != null) {
        //     const hide2 = this.$message.loading('正在更新课程数据...', 0);
        //     this.$store.dispatch('updateAllClasses', data).then((changeList) => {
        //       this.$message.success('课程数据已更新！');
        //       if (changeList.length > 0) {
        //         this.showChangeList(changeList);
        //       }
        //     }).catch(() => {
        //       this.$message.error('更新课程数据时出错，请刷新页面重试！', 30);
        //     }).finally(() => {
        //       this.$store.dispatch('updateAllClassesExtra');
        //       this.$store.commit('LOADED', true);
        //       hide2();
        //     });
        //   } else {
        //     this.$store.dispatch('updateAllClassesExtra');
        //     this.$store.commit('LOADED', true);
        //   }
        // }).catch(() => {
        //   this.$store.dispatch('updateAllClassesExtra');
        //   this.$store.commit('LOADED', true);
        //   this.$message.error('检查课程数据更新时出错，请刷新页面重试！', 30);
        // }).finally(() => {
        //   hide();
        // });
      })
    },
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
