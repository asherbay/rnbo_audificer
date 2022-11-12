import React, {useState, useEffect} from 'react'
import styled from 'styled-components'
import AudioNetwork from './AudioNetwork'
// import AudioModule from './AudioNetwork'
import RNBO from '@rnbo/js'
import require from 'requirejs'

const MatrixConfig = (props) => {
    const {setSelAudioModules} = props
    // const audioModuleTypes = ["Op", "TestTone", "Filter", "Comb"]
    const [audioModuleCount, setAudioModuleCount] = useState({"Op": 0, "TestTone": 0, "Filter": 0, "Comb": 0})


    const setQuant = (e) => {
      console.log(e)
      let type = e.target.name
      let newCount = audioModuleCount
      newCount[type] = e.target.value
      setAudioModuleCount(newCount)
    }

    const addGroup = () => {
      let selMods = []
      Object.keys(audioModuleCount).forEach((type)=>{
        let i = 0
        while (i<audioModuleCount[type]){
          selMods.push(type)
          i++
        }
      })
      console.log('selMods: ', selMods)
      setSelAudioModules(selMods)
    }

    const renderOptions = () => {
        return Object.keys(audioModuleCount).map((type)=>{
          return (
            <Quantity> 
              <span>{type}</span>
              <input style={{width: "30px"}} type="number" min="0" name={type} onChange={setQuant}/>
            </Quantity>)
          
        })
    }
    
  return (
    <Box>
      {renderOptions()}
      <button style={{margin: "5px"}} onClick={addGroup}>add</button>
    </Box>
  )
}


export default MatrixConfig


export const Quantity = styled.span`
  &>*{
    margin: 5px;
  }
    display: flex;
    width: 100%;
    gap: 0px;
    
`
export const Box = styled.span`
    display: flex;
    flex-direction: column;
    gap: 5px;
    width: 130px;
    border: 1px solid black;
    align-items: start;
    justify-content: center;
`

//feature/asher.bay/GCA-dbscripting