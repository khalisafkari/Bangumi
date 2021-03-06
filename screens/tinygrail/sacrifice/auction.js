/*
 * @Author: czy0729
 * @Date: 2019-11-17 15:33:52
 * @Last Modified by: czy0729
 * @Last Modified time: 2020-03-16 15:55:31
 */
import React from 'react'
import { View } from 'react-native'
import PropTypes from 'prop-types'
import {
  Flex,
  Input,
  Text,
  Button,
  Slider as CompSlider,
  Iconfont
} from '@components'
import { Popover } from '@screens/_'
import { _ } from '@stores'
import { formatNumber, lastDate, toFixed } from '@utils'
import { observer } from '@utils/decorators'
import Stepper from './stepper'

const countDS = ['到500', '到2500', '到12500', '最大']

function Auction({ style }, { $ }) {
  const styles = memoStyles()
  const { auctionLoading, auctionAmount, auctionPrice, lastAuction } = $.state
  const { price = 0, amount } = $.valhallChara
  const { balance } = $.assets
  const { state, type } = $.auctionStatus
  return (
    <View style={[styles.container, style]}>
      <Flex>
        <Flex.Item flex={1.4}>
          <Text style={styles.plain}>
            竞拍
            <Text style={styles.text} size={12} lineHeight={14}>
              {' '}
              底价 (₵{price ? toFixed(price + 0.01, 2) : '-'})
            </Text>
          </Text>
        </Flex.Item>
        <Flex.Item style={_.ml.sm}>
          <Text style={styles.text} size={12}>
            数量 ({amount ? formatNumber(amount, 0) : '-'}股)
          </Text>
        </Flex.Item>
        <View style={[styles.btnSubmit, _.ml.sm]} />
      </Flex>
      <Flex style={_.mt.sm}>
        <Flex.Item flex={1.4}>
          <View style={styles.inputWrap}>
            <Stepper />
          </View>
        </Flex.Item>
        <Flex.Item style={_.ml.sm}>
          <Flex style={styles.inputWrap}>
            <Input
              style={styles.input}
              keyboardType='numeric'
              value={String(auctionAmount)}
              onChangeText={$.changeAuctionAmount}
            />
            <View style={styles.popover}>
              <Popover data={countDS} onSelect={$.changeAuctionAmountByMenu}>
                <Flex style={styles.count} justify='center'>
                  <Iconfont
                    name='down'
                    size={18}
                    color={_.colorTinygrailText}
                  />
                </Flex>
              </Popover>
            </View>
          </Flex>
        </Flex.Item>
        <View style={[styles.btnSubmit, _.ml.sm]}>
          <Button
            style={{
              height: 36
            }}
            type='bid'
            radius={false}
            loading={auctionLoading}
            onPress={$.doAuction}
          >
            竞拍
          </Button>
        </View>
      </Flex>
      {!!lastAuction.time && (
        <Text style={_.mt.sm} type='warning' size={12}>
          上次出价 (₵{lastAuction.price} / {formatNumber(lastAuction.amount, 0)}
          股 / {lastDate(lastAuction.time)})
        </Text>
      )}
      <Flex style={_.mt.md}>
        <Flex.Item>
          <Text style={styles.plain} size={12}>
            合计{' '}
            <Text
              style={{
                color: _.colorAsk
              }}
              size={12}
            >
              -₵{toFixed(auctionAmount * auctionPrice, 2)}
            </Text>
          </Text>
        </Flex.Item>
        <Text style={[styles.text, _.ml.sm]} size={12}>
          当前竞拍 {state}人 / {formatNumber(type, 0)}股
        </Text>
      </Flex>
      <Flex style={[styles.slider, _.mt.sm]}>
        <View style={{ width: '100%' }}>
          <CompSlider
            value={auctionAmount}
            min={0}
            max={parseInt(balance / Math.max(auctionPrice, price || 1))}
            step={1}
            minimumTrackTintColor={_.colorAsk}
            maximumTrackTintColor={_.colorTinygrailBorder}
            onChange={value => $.changeAuctionAmount(value)}
          />
        </View>
      </Flex>
      <Flex>
        <Flex.Item>
          <Text style={styles.text} size={12}>
            余额 0
          </Text>
        </Flex.Item>
        <Text style={styles.text} size={12}>
          ₵{formatNumber(balance, 2)}
        </Text>
      </Flex>
    </View>
  )
}

Auction.contextTypes = {
  $: PropTypes.object,
  navigation: PropTypes.object
}

export default observer(Auction)

const memoStyles = _.memoStyles(_ => ({
  container: {
    padding: _.wind,
    backgroundColor: _.colorTinygrailBg
  },
  inputWrap: {
    paddingLeft: 4,
    borderColor: _.colorTinygrailBorder,
    borderWidth: 1
  },
  input: {
    height: 34,
    color: _.colorTinygrailPlain,
    backgroundColor: 'transparent',
    borderWidth: 0,
    borderRadius: 0
  },
  popover: {
    position: 'absolute',
    zIndex: 1,
    top: 0,
    right: 0
  },
  count: {
    width: 34,
    height: 34,
    borderLeftWidth: 1,
    borderColor: _.colorTinygrailBorder
  },
  placeholder: {
    position: 'absolute',
    top: 8,
    right: 8
  },
  slider: {
    height: 40,
    opacity: 0.8
  },
  plain: {
    color: _.colorTinygrailPlain
  },
  btnSubmit: {
    width: 64
  },
  text: {
    color: _.colorTinygrailText
  }
}))
