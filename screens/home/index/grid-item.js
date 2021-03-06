/*
 * @Author: czy0729
 * @Date: 2019-10-20 17:49:25
 * @Last Modified by: czy0729
 * @Last Modified time: 2020-03-07 15:28:03
 */
import React from 'react'
import { View } from 'react-native'
import PropTypes from 'prop-types'
import { observer } from 'mobx-react'
import { Progress } from '@ant-design/react-native'
import { Cover } from '@screens/_'
import { _ } from '@stores'

const margin = 10
const imageWidth = (_.window.width - 3 * margin - 2 * _.wind) / 4

function GridItem({ subject, subject_id: subjectId }, { $ }) {
  const styles = memoStyles()
  const { current } = $.state
  const isCurrent = current === subjectId
  return (
    <View style={styles.item}>
      <Cover
        style={isCurrent ? styles.opacity : undefined}
        size={imageWidth}
        src={subject.images.medium}
        border
        radius
        delay={false}
        onPress={() => $.selectGirdSubject(subjectId)}
      />
      <Progress
        style={styles.progress}
        barStyle={styles.bar}
        percent={$.percent(subjectId, subject)}
        unfilled
      />
    </View>
  )
}

GridItem.defaultProps = {
  subject: {},
  subject_id: 0
}

GridItem.contextTypes = {
  $: PropTypes.object
}

export default observer(GridItem)

const memoStyles = _.memoStyles(_ => ({
  item: {
    width: imageWidth,
    marginLeft: margin,
    marginBottom: margin
  },
  progress: {
    borderRadius: _.radiusXs,
    backgroundColor: _.select('transparent', _._colorDarkModeLevel1)
  },
  bar: {
    borderBottomWidth: 6,
    borderRadius: _.radiusXs,
    borderColor: _.colorWarning
  },
  opacity: {
    opacity: 0.6
  }
}))
