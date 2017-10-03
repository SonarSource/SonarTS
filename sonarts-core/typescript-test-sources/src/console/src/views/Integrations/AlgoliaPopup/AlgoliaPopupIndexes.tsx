import * as React from 'react'
import * as Relay from 'react-relay'
import { $p } from 'graphcool-styles'
import * as cx from 'classnames'
import styled from 'styled-components'
import {Viewer, SearchProviderAlgolia} from '../../../types/types'
import PopupWrapper from '../../../components/PopupWrapper/PopupWrapper'
import {withRouter} from 'react-router'
import AlgoliaPopupIndexTop from './AlgoliaPopupIndexTop'
import AlgoliaPopupIndex from './AlgoliaPopupIndex'
import mapProps from '../../../components/MapProps/MapProps'

interface Props {
  viewer: Viewer
  params: any
  router: ReactRouter.InjectedRouter
  algolia: SearchProviderAlgolia
}

interface State {
}

class AlgoliaPopupIndexes extends React.Component<Props, State> {
  render() {
    const {algolia, params} = this.props
    return (
      <div>
        <AlgoliaPopupIndexTop params={params} />
        {
          algolia
       && algolia.algoliaSyncQueries
       && algolia.algoliaSyncQueries.edges.map(edge => edge.node)
        .map(index => (
          <AlgoliaPopupIndex params={params} key={index.id} index={index} algolia={algolia} />
        ))}
      </div>
    )
  }
}

export default Relay.createContainer(withRouter(AlgoliaPopupIndexes), {
  fragments: {
    algolia: () => Relay.QL`
      fragment on SearchProviderAlgolia {
        ${AlgoliaPopupIndex.getFragment('algolia')}
        algoliaSyncQueries(first: 100) {
          edges {
            node {
              id
              ${AlgoliaPopupIndex.getFragment('index')}
            }
          }
        }
      }
    `,
  },
})
