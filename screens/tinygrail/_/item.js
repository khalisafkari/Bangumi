/*
 * @Author: czy0729
 * @Date: 2019-08-25 19:51:55
 * @Last Modified by: czy0729
 * @Last Modified time: 2020-03-08 14:26:30
 */
import React from 'react'
import { Alert, View } from 'react-native'
import PropTypes from 'prop-types'
import { observer } from 'mobx-react'
import { Flex, Text, Touchable } from '@components'
import { Avatar, StockPreview } from '@screens/_'
import { _, tinygrailStore } from '@stores'
import { lastDate, getTimestamp, formatNumber, toFixed } from '@utils'
import { tinygrailOSS, tinygrailFixedTime, formatTime } from '@utils/app'
import { t } from '@utils/fetch'
import { EVENT, B, M } from '@constants'
import Popover from './popover'

const types = ['bid', 'asks', 'chara']
let timezone = new Date().getTimezoneOffset() / -60
if (String(timezone).length === 1) {
  timezone = `0${timezone}`
}

function Item(props, { $, navigation }) {
  const styles = memoStyles()
  const {
    _index,
    index,
    id,
    monoId,
    name,
    icon,
    lastOrder,
    end,
    marketValue,
    total,
    bonus,
    users,
    type,
    amount,
    price,
    state,
    sacrifices,
    rate,
    level,
    current,
    event,
    onAuctionCancel
  } = props
  const go = props.go || $.state.go
  const { id: eventId, data: eventData } = event
  const colorMap = {
    bid: _.colorBid,
    asks: _.colorAsk,
    chara: _.colorWarning,
    ico: _.colorPrimary,
    auction: _.colorWarning
  }

  // 用show判断是否精简模式
  const { _stockPreview: show } = tinygrailStore.state

  const isICO = users !== undefined // 有users为ico中
  const isDeal = !!type // 有此值为用户委托单
  const isAuction = type === 'auction'
  const isValhall = type === 'valhall'

  let marketValueText // 总市场价
  let totalText // 总量
  if (show || isICO) {
    if (marketValue > B) {
      marketValueText = `${toFixed(marketValue / B, 1)}亿`
    } else if (marketValue > M) {
      marketValueText = `${toFixed(marketValue / M, 1)}万`
    } else {
      marketValueText = formatNumber(marketValue, 0)
    }

    if (total > 1000) {
      totalText = `${toFixed(total / M, 1)}万`
    } else {
      totalText = formatNumber(total, 0)
    }
  }

  let extra
  if (isICO) {
    // ICO结束时间
    let _end = end
    if (!String(_end).includes('+')) {
      _end = `${end}+${timezone}:00`
    }
    extra = `${formatTime(_end)} / 已筹集${totalText || '-'}`
  } else {
    // 流动股息比
    extra = `+${toFixed(rate, 2)}`
    if (show) {
      const rateRatio = toFixed(((rate || 0) / (current || 10)) * 10, 1)
      extra += ` (${rateRatio})`
    }

    // 圣殿股息比
    const templeRate = toFixed((rate || 0) * (level + 1) * 0.3, 1)
    if (level !== undefined) {
      extra += ` / +${templeRate}`
    }

    if (show) {
      const templeRateRatio = toFixed(
        ((templeRate || 0) / (current || 10)) * 10,
        1
      )
      extra += ` (${templeRateRatio})`
    }

    if (isValhall) {
      extra += ` / 底价${toFixed(price, 1)} / 数量${formatNumber(state, 0)}`
    } else {
      if (show) {
        extra += ` / ${lastDate(getTimestamp(tinygrailFixedTime(lastOrder)))}`
      }
      if (marketValueText) {
        extra += ` / 总${marketValueText}`
      }
      if (totalText) {
        extra += ` / 量${totalText}`
      }
    }
  }

  if (users && users !== 'ico') {
    extra += ` / ${users || '-'}人`
  }

  let prevText
  let auctionText = '竞拍中'
  let auctionTextColor = _.colorWarning
  let auctionSubText = ''
  if (types.includes(type)) {
    prevText = `${state}股`
  } else if (type === 'ico') {
    prevText = `注资${state}`
  } else if (type === 'auction') {
    auctionSubText = `₵${price} / ${formatNumber(amount, 0)}`
    if (state === 1) {
      auctionText = '成功'
      auctionTextColor = _.colorBid
    } else if (state === 2) {
      auctionText = '失败'
      auctionTextColor = _.colorAsk
    }
  }
  const auctioning = auctionText === '竞拍中'

  return (
    <Flex style={styles.container} align='start'>
      <Avatar
        style={styles.image}
        src={tinygrailOSS(icon)}
        size={40}
        name={name}
        borderColor='transparent'
        onPress={() => {
          t(eventId, {
            to: 'Mono',
            monoId: monoId || id,
            ...eventData
          })

          navigation.push('Mono', {
            monoId: `character/${monoId || id}`
          })
        }}
      />
      <Flex.Item style={index !== 0 && styles.border}>
        <Flex align='start'>
          <Flex.Item>
            <Touchable
              style={styles.item}
              onPress={() => {
                // ICO不受复写go参数影响跳转
                if (isICO) {
                  t(eventId, {
                    to: 'TinygrailICODeal',
                    monoId: monoId || id,
                    ...eventData
                  })
                  navigation.push('TinygrailICODeal', {
                    monoId: `character/${monoId || id}`
                  })
                  return
                }

                const _id = isAuction || isValhall ? monoId || id : id
                if (go) {
                  getOnPress(_id, go, navigation, eventId, eventData)()
                  return
                }

                t(eventId, {
                  to: 'TinygrailDeal',
                  monoId: _id,
                  ...eventData
                })
                navigation.push('TinygrailDeal', {
                  monoId: `character/${_id}`
                })
              }}
            >
              <Flex align='start'>
                <Flex.Item>
                  <Text style={styles.textPlain} size={15}>
                    {!isDeal && `${_index}. `}
                    {name}
                    {!!bonus && (
                      <Text size={12} lineHeight={15} type='warning'>
                        {' '}
                        x{bonus}
                      </Text>
                    )}
                    {parseInt(level) > 1 && (
                      <Text style={styles.textAsk} size={12} lineHeight={15}>
                        {' '}
                        lv{level}
                      </Text>
                    )}
                  </Text>
                  <Text style={styles.extraText} size={11}>
                    {isDeal && (
                      <Text
                        style={{
                          color: colorMap[type]
                        }}
                        size={11}
                      >
                        {prevText}
                      </Text>
                    )}
                    {!!sacrifices && ' / '}
                    {!!sacrifices && (
                      <Text style={styles.textBid} size={11}>
                        塔{sacrifices}
                      </Text>
                    )}
                    {isDeal && !isAuction && !isValhall && ' / '}
                    {extra}
                  </Text>
                </Flex.Item>
                {isAuction && (
                  <View>
                    <Text
                      style={{
                        color: auctionTextColor
                      }}
                      size={15}
                      align='right'
                    >
                      {auctionText}
                    </Text>
                    <Text style={styles.auctionSubText} size={12} align='right'>
                      {auctionSubText}
                    </Text>
                  </View>
                )}
              </Flex>
            </Touchable>
          </Flex.Item>
          {isAuction && auctioning && (
            <Touchable
              style={styles.auctionCancel}
              onPress={() =>
                Alert.alert('警告', '周六取消需要收取手续费, 确定取消?', [
                  {
                    text: '取消',
                    style: 'cancel'
                  },
                  {
                    text: '确定',
                    onPress: () => onAuctionCancel(id)
                  }
                ])
              }
            >
              <Text style={styles.auctionCancelText} size={15}>
                [取消]
              </Text>
            </Touchable>
          )}
          {!isAuction && (
            <StockPreview
              style={styles.stockPreview}
              {...props}
              _loaded
              theme='dark'
            />
          )}
          {!isICO && <Popover id={monoId || id} event={event} />}
        </Flex>
      </Flex.Item>
    </Flex>
  )
}

Item.contextTypes = {
  $: PropTypes.object,
  navigation: PropTypes.object
}

Item.defaultProps = {
  event: EVENT,
  onAuctionCancel: Function.prototype
}

export default observer(Item)

const memoStyles = _.memoStyles(_ => ({
  container: {
    paddingLeft: _.wind,
    backgroundColor: _.colorTinygrailContainer
  },
  image: {
    marginRight: _.xs,
    marginTop: _.md
  },
  item: {
    paddingVertical: _.md,
    paddingLeft: _.sm
  },
  border: {
    borderTopColor: _.colorTinygrailBorder,
    borderTopWidth: _.hairlineWidth
  },
  textPlain: {
    color: _.colorTinygrailPlain
  },
  textAsk: {
    color: _.colorAsk
  },
  textBid: {
    color: _.colorBid
  },
  extraText: {
    ..._.mt.xs,
    color: _.colorTinygrailText
  },
  auctionSubText: {
    ..._.mt.xs,
    color: _.colorTinygrailText
  },
  auctionCancel: {
    paddingVertical: _.md,
    paddingLeft: _.md
  },
  auctionCancelText: {
    color: _.colorTinygrailText
  },
  stockPreview: {
    marginRight: -12
  }
}))

/**
 * 路由跳转复写
 * @param {*} charaId
 * @param {*} go
 * @param {*} navigation
 */
function getOnPress(charaId, go, navigation, eventId, eventData) {
  return () => {
    let to
    let params
    switch (go) {
      case 'K线':
        to = 'TinygrailTrade'
        break
      case '买入':
        to = 'TinygrailDeal'
        params = {
          type: 'bid'
        }
        break
      case '卖出':
        to = 'TinygrailDeal'
        params = {
          type: 'asks'
        }
        break
      case '资产重组':
        to = 'TinygrailSacrifice'
        break
      default:
        return
    }

    t(eventId, {
      to,
      monoId: charaId,
      ...eventData
    })
    navigation.push(to, {
      monoId: `character/${charaId}`,
      ...params
    })
  }
}
