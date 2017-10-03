import * as React from 'react'
import Popup from '../Popup'
import Youtube from 'react-youtube'

interface Props {
  onRequestClose: () => void
  videoId: string
}

const VideoPopup = ({onRequestClose, videoId}: Props) => (
  <Popup
    onRequestClose={onRequestClose}
    width={853}
  >
    <Youtube
      videoId={videoId}
      opts={{
        width: 853,
        height: 480,
        playerVars: {
          autoplay: 1,
        },

      }}
    />
  </Popup>
)

export default VideoPopup
