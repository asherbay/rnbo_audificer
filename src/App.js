import React, {useState, useEffect} from 'react'
import styled from 'styled-components'
import MatrixConfig from './MatrixConfig'
import AudioNetwork from './AudioNetwork'

const App = () => {
    const [selAudioModules, setSelAudioModules] = useState([])
    const [selControlModules, setSelControlModules] = useState([])


  return (
    <div>
        {(selAudioModules.length>0 && selControlModules.length>0) ?  
            <AudioNetwork selAudioModules={selAudioModules} selControlModules={selControlModules}/> 
        :
            <MatrixConfig setSelAudioModules={setSelAudioModules} setSelControlModules={setSelControlModules}/>
        }
    </div>
  )
}

export default App