import * as React from 'react' // tslint:disable-line
import {$p, variables} from 'graphcool-styles'
import styled from 'styled-components'
import * as cx from 'classnames'
import {connect} from 'react-redux'
import {setClient} from '../../../../actions/codeGeneration'
import calculateSize from 'calculate-size'

const ConditionButton = styled.div`
  &:not(.${$p.bgBlue}):hover {
    background-color: ${variables.gray10};
  }
`

const clients = [
  'lokka',
  'fetch',
  // 'apollo',
  // 'relay',
]

const Chooser = (props) => (
  <div className={cx($p.bb, $p.bBlack10)}>
    <div
      className={cx($p.pa38, $p.pt16, $p.flex, $p.flexColumn, $p.itemsCenter)}
    >
      <h2 className={cx($p.fw3, $p.mb10, $p.tc)}>Client</h2>
      <div className={cx($p.dib, $p.mt25)}>
        <div
          className={cx(
            $p.flex,
            $p.flexRow,
            $p.justifyAround,
            $p.ph16,
            $p.pv6,
            $p.relative,
            $p.itemsCenter,
           )}
        >
          {clients.map(env => {
            const {width} = calculateSize(env.toUpperCase(), {
              fontSize: '14px',
              fontWeight: '600',
            })

            return (
              <div
                className={cx($p.relative, $p.flex, $p.itemsCenter, $p.justifyCenter, $p.pointer)}
                onClick={() => props.setClient(env)}
                style={{width: width + 15}}
                key={env}
              >
                <ConditionButton
                  className={cx($p.nowrap, $p.absolute, $p.ph10, $p.flex, $p.flexRow, $p.itemsCenter, {
                  [cx($p.pv6, $p.bgBlack04)]: props.client !== env,
                  [cx($p.bgBlue, $p.br2, $p.pv8, $p.z1)]: props.client === env,
                })}
                >
                  <div
                    className={cx($p.ttu, $p.fw6, $p.f14, {
                    [$p.black30]: props.client !== env,
                    [$p.white]: props.client === env,
                  },
                )}
                  >
                    {env}
                  </div>
                </ConditionButton>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  </div>
)

export default connect(
  state => ({
    client: state.codeGeneration.client,
  }),
  {
    setClient,
  },
)(Chooser)
