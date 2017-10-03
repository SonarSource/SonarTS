import * as React from 'react'
import { getQueries } from '../../utils/QueryHistoryStorage'
import { Query } from '../../types/utils'
import ClickOutside from 'react-click-outside'
const classes: any = require('./QueryHistory.scss')

function stringify (obj: any): string {
  if (!obj) {
    return ''
  }

  const pairs = Object.keys(obj).map((key) => (
    `${key}: ${JSON.stringify(obj[key])}`
  ))

  return pairs.join(', ')
}

interface Props {
  projectId: string
  onQuerySelect: (query: Query) => void
  onClickOutside: () => any
}

interface State {
  queries: Query[]
  selectedIndex: number
}

export default class QueryHistory extends React.Component<Props, State> {

  constructor (props) {
    super(props)

    this.state = {
      queries: getQueries(this.props.projectId),
      selectedIndex: 0,
    }
  }

  render () {
    if (this.state.queries.length === 0) {
      return (
        <div className={classes.root}>
          No history yet
        </div>
      )
    }

    return (
      <ClickOutside onClickOutside={this.props.onClickOutside}>
        <div className={classes.root}>
          <div className={classes.list}>
            {this.state.queries.map((query, index) => (
              <div
                key={index}
                className={`${classes.query} ${this.state.selectedIndex === index ? classes.querySelected : ''}`}
                onMouseEnter={() => this.setState({ selectedIndex: index } as State)}
                onClick={() => this.selectQuery(index)}
                >
                <div className={classes.queryDate}>
                  {query.date.toLocaleString()}
                </div>
                <div className={classes.queryText}>
                  {query.query}
                </div>
                {query.variables &&
                  <div className={classes.queryText}>
                    {stringify(JSON.parse(query.variables))}
                  </div>
                }
              </div>
            ))}
          </div>
          <div
            className={classes.details}
            onClick={() => this.selectQuery(this.state.selectedIndex)}
            >
            Query:
            <div
              className={classes.detailsQuery}
              dangerouslySetInnerHTML={{__html: this.state.queries[this.state.selectedIndex].query}}
              >
            </div>
            <br />
            Variables:
            <div
              className={classes.detailsQuery}
              dangerouslySetInnerHTML={{__html: this.state.queries[this.state.selectedIndex].variables}}
              >
            </div>
          </div>
        </div>
      </ClickOutside>
    )
  }

  private selectQuery (index) {
    this.props.onQuerySelect(this.state.queries[index])
  }
}
