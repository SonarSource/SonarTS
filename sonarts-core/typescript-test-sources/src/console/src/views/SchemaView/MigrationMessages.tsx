import * as React from 'react'
import {MigrationMessage, MigrationError} from './SchemaEditor'

interface Props {
  messages: MigrationMessage[]
  errors: MigrationError[]
}

export default function MigrationMessages({messages, errors}: Props) {
  return (
    <div className='migration-messages'>
      <style jsx={true}>{`
        .migration-messages {
          font-family: Source Code Pro,Consolas,Inconsolata,Droid Sans Mono,Monaco,monospace;
          @p: .white, .f16, .w100, .bgBlack30, .pa16, .overflowAuto, .nosb;
          max-height: 400px;
        }
        .message {
          @p: .pv4;
        }
        .sub-messages {
          @p: .ml16;
        }
        .errors {
          @p: .red;
        }
      `}</style>
      {messages.length > 0 && (
        <div>
          <h2>Pending Changes</h2>
          {messages.map(message => (
            <div className='message' key={message.name}>
              <div className='description'><b>{message.name}</b>: {message.description}</div>
              <div className='sub-messages'>
                {message.subDescriptions.map(subMessage => (
                  <div className='description'><b>{subMessage.name}</b>: {subMessage.description}</div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
      {errors.length > 0 && (
        <div className='errors'>
          <h2>Errors</h2>
          {errors.map(error => (
            <div className='message'><b>{error.field}</b>: {error.description}</div>
          ))}
        </div>
      )}
    </div>
  )
}
