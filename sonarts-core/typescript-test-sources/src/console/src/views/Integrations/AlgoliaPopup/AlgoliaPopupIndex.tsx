import * as React from 'react'
import * as Relay from 'react-relay'
import { $p } from 'graphcool-styles'
import * as cx from 'classnames'
import styled from 'styled-components'
import {Viewer, SearchProviderAlgolia, AlgoliaSyncQuery} from '../../../types/types'
import PopupWrapper from '../../../components/PopupWrapper/PopupWrapper'
import {withRouter} from 'react-router'
import AlgoliaPopupIndexTop from './AlgoliaPopupIndexTop'
import {Link} from 'react-router'
import UpdateAlgoliaSyncQueryMutation from '../../../mutations/UpdateAlgoliaSyncQueryMutation'
import NewToggleButton from '../../../components/NewToggleButton/NewToggleButton'
import AlgoliaIndexPopupQuery from './AlgoliaIndexPopup/AlgoliaIndexPopupQuery'
import GraphQLCode from '../../../components/GraphQLCode/GraphQLCode'

interface Props {
  index: AlgoliaSyncQuery
  algolia: SearchProviderAlgolia
  params: any
}

interface State {
}
class AlgoliaPopupIndexes extends React.Component<Props, State> {
  render() {
    const {algolia, params, index: {indexName, fragment, isEnabled, model, id}} = this.props
    return (
      <div
        className={cx($p.flex, $p.flexRow)}
      >
        <div className={cx($p.ph38, $p.w50, $p.relative)}>
          <Link
            className={cx($p.black, $p.fw3, $p.f25, $p.mt10, $p.pointer, $p.db, $p.pr16)}
            to={`/${params.projectName}/integrations/algolia/edit/${id}`}
          >{indexName}</Link>
          <div
            className={cx($p.bgBlack10, $p.f16, $p.pv0, $p.ph6, $p.mt16, $p.dib)}
          >
            {model.name}
          </div>
          <div className={cx($p.absolute, $p.top16, $p.right16)}>
            <NewToggleButton
              defaultChecked={isEnabled}
              onChange={this.toggle}
              className={cx($p.mt4)}
            />
          </div>
        </div>
        <Link
          className={cx($p.bgDarkBlue, $p.pa38, $p.w50, $p.pt10)}
          to={`/${params.projectName}/integrations/algolia/edit/${id}`}
        >
          <GraphQLCode code={fragment} />
        </Link>
      </div>
    )
  }

  toggle = (e) => {
    const {index: {id, fragment, indexName, isEnabled}} = this.props

    Relay.Store.commitUpdate(
      new UpdateAlgoliaSyncQueryMutation({
        algoliaSyncQueryId: id,
        indexName,
        fragment,
        isEnabled: !isEnabled,
      }),
    )
  }
}

export default Relay.createContainer(withRouter(AlgoliaPopupIndexes), {
  fragments: {
    algolia: () => Relay.QL`
      fragment on SearchProviderAlgolia {
        ${AlgoliaIndexPopupQuery.getFragment('algolia')}
      }
    `,
    index: () => Relay.QL`
      fragment on AlgoliaSyncQuery {
        id
        fragment
        indexName
        isEnabled
        model {
          id
          name
        }
      }
    `,
  },
})
