import * as React from 'react'

interface Props {
  seats: string[]
  maxSeats: number
  className?: string
}

export default class Seats extends React.Component<Props, {}> {

  render() {
    const usedSeatsString =  this.props.maxSeats > 0 ? this.props.seats.length + '' : this.props.seats.length + ' seats'
    const seatsString =  this.props.maxSeats > 0 ? '/ ' + this.props.maxSeats + ' seats' : ' (unlimited)'
    return (
      <div className={`flex itemsCenter ${this.props.className || ''}`}>
        {this.usedSeats()}
        {this.freeSeats()}
        <div className='ml6 f14 green fw6'>{usedSeatsString}</div>
        <div className='ml6 f14 black50'>{seatsString}</div>
      </div>
    )
  }

  private usedSeats = (): JSX.Element => {
    return (
      <div className='flex'>
        {this.props.seats.map((name, i) => {
          return (<div
            key={i}
            className='flex itemsCenter justifyCenter mr4 bgLightgreen20 green br100 fw7 f14'
            style={{width: '22px', height: '22px', marginTop: -2}}
          >{name.charAt(0)}</div>)
        })}
      </div>
    )
  }

  private freeSeats = (): JSX.Element => {

    const numberOfEmptyRows = this.props.maxSeats - this.props.seats.length

    let numbers = []
    for (let i = 0; i < numberOfEmptyRows; i++) {
      numbers.push(i)
    }

    return (
      <div className='flex'>
        {numbers.map((i) => {
          return (<div
            key={i}
            className='mr4 bgBlack07 br100'
            style={{width: '20px', height: '20px'}}
           />)
        })}
      </div>
    )
  }

}
