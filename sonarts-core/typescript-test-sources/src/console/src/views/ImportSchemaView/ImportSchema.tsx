import * as React from 'react'
import * as Modal from 'react-modal'
import modalStyle from '../../utils/modalStyle'
import SchemaImportEditor from './SchemaImportEditor'
import Intro from './Intro'

const importSchemaModalStyle = {
  overlay: {
    ...modalStyle.overlay,
    backgroundColor: 'transparent',
  },
  content: {
    ...modalStyle.content,
    width: 795,
  },
}

export default class ImportSchema extends React.Component<null,null> {
  render() {
    return (
      <Modal
        style={importSchemaModalStyle}
        isOpen={true}
        contentLabel='Import Schema'
      >
        <div className='import-schema'>
          <style jsx={true}>{`
            .import-schema {
              @p: .flex;
            }
          `}</style>
          <SchemaImportEditor />
          <Intro />
        </div>
      </Modal>
    )
  }
}
