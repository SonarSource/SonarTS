import * as React from 'react'
import InfoBox from '../../components/InfoBox'

const Intro  = () => (
  <div>
    <h1>Get your backend in 2 minutes</h1>
    <div>With Graphcool you can create a GraphQL Backend based on the schema definition you see on the right side.</div>
    <div className='features'>
      <div className='feature'>
        <img src='' alt=''/>
        <div>Create an account</div>
      </div>
      <div className='feature'>
        <img src='' alt=''/>
        <div>Get GraphQL endpoint</div>
      </div>
      <div className='feature'>
        <img src='' alt=''/>
        <div>Connect with your app</div>
      </div>
    </div>
    <InfoBox>
      <div>We also have a CLI-Tool for ues cases like this:</div>
      <a href='https://www.npmjs.com/package/graphcool'>npmjs.org/graphcool</a>
    </InfoBox>
  </div>
)

export default Intro
