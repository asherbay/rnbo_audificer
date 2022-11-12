import React, {useState, useEffect} from 'react'
import styled from 'styled-components'
import MatrixConfig from './MatrixConfig'
import AudioNetwork from './AudioNetwork'

const App = () => {
    const [selAudioModules, setSelAudioModules] = useState([])

  return (
    <div>
        {selAudioModules.length>0 ? 
            <AudioNetwork selAudioModules={selAudioModules}/> 
        :
            <MatrixConfig setSelAudioModules={setSelAudioModules}/>
        }
    </div>
  )
}

export default App