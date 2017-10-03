import * as React from 'react'

export default function mapProps(mapping: { [key: string]: (props: any) => any }) {
  return (DecoratedComponent) => {
    class MapProps extends React.Component<{}, {}> {

      static DecoratedComponent = DecoratedComponent

      render() {
        let mapped

        try {
          mapped = Object.keys(mapping).reduce(
            (acc, key) => (Object.assign({}, acc, {
              [key]: mapping[key](this.props),
            })),
            {},
          )
        } catch (err) {
          console.log('Caught exception in <MapProps>')
          console.error(err)
          return null
        }

        const newProps = Object.assign({}, this.props, mapped)

        return <DecoratedComponent {...newProps}/>
      }
    }

    return MapProps
  }
}
