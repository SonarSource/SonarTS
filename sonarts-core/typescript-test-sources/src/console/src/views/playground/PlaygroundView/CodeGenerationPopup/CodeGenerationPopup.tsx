import * as React from 'react'
import {$p} from 'graphcool-styles'
import * as cx from 'classnames'
import {connect} from 'react-redux'
import styled from 'styled-components'
import {withRouter} from 'react-router'
import CodeGenerationPopupCode from './CodeGenerationPopupCode'
import CodeGenerationPopupHeader from './CodeGenerationPopupHeader'
import CodeGenerationPopupEnvironmentChooser from './CodeGenerationPopupEnvironmentChooser'
import CodeGenerationPopupClientChooser from './CodeGenerationPopupClientChooser'
import PopupWrapper from '../../../../components/PopupWrapper/PopupWrapper'
import {closePopup} from '../../../../actions/popup'
import tracker from '../../../../utils/metrics'
import {ConsoleEvents} from 'graphcool-metrics'

interface Props {
  query?: string
  params: any
  router: ReactRouter.InjectedRouter
  closePopup: (id: string) => void
  id: string
  endpointUrl: string
}

const Container = styled.div`
  width: 800px;
`

const ContainerWrapper = styled.div`
  max-height: 100vh;
`

class CodeGenerationPopup extends React.Component<Props, {}> {
  componentDidMount() {
    tracker.track(ConsoleEvents.Playground.CodeGenerationPopup.opened())
  }
  render() {
    const {query, params, id, endpointUrl} = this.props
    const queryActive = query && query.length > 0
    return (
      <PopupWrapper
        onClickOutside={() => this.props.closePopup(id)}
      >
        <div
          className={cx(
            $p.flex,
            $p.justifyCenter,
            $p.itemsCenter,
            $p.h100,
            $p.bgWhite50,
            $p.overflowHidden,
          )}
        >
          <ContainerWrapper className={cx($p.overflowScroll, $p.buttonShadow)}>
            <Container
              className={cx(
                $p.bgWhite,
                $p.br2,
                $p.flex,
                $p.flexColumn,
                $p.overflowXHidden,
              )}
            >
              <CodeGenerationPopupHeader
                queryActive={queryActive}
                params={params}
              />
              <CodeGenerationPopupEnvironmentChooser />
              <CodeGenerationPopupClientChooser />
              <CodeGenerationPopupCode
                endpointUrl={endpointUrl}
                query={query}
              />
            </Container>
          </ContainerWrapper>
        </div>
      </PopupWrapper>
    )
  }
}

export default connect(null, {
  closePopup,
})(withRouter(CodeGenerationPopup))
