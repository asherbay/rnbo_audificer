import {useEffect, useState} from 'react'
import * as Tone from 'tone'
import RNBO from '@rnbo/js'
import styled from 'styled-components'
import Matrix from './components/Matrix'


//import AudioOut from './patchers/AudioOut.export.json'

import require from 'requirejs'

function App() {

  let context
  let outputNode
  let audioModules = [

  ]
  // const [audioModules, setAudioModules] = useState([])
  // useEffect(()=>{
  //   setup()
  // })

  const countModuleType = (type) => {
    let count = 0
    audioModules.forEach((mod)=>{
      if(mod.type===type){
        count++
      }
    })
    return count
  }

  class Send {
    constructor(source, target){
      this.source = source
      this.target = target
      // this.node = context.createGain()
      this.deviceJSON = require('./patchers/AudioSend.export.json')
      this.device = null
    }
  }

  class AudioModule {
    constructor(type){
      this.type = type
      this.name = type+(countModuleType(type) + 1)
      this.deviceJSON = require('./patchers/'+type+'.export.json')
      this.device = null
      this.sends = []
    }

    async sendTo(targetModule){
      let send = new Send(this, targetModule)
      send.device = await jsonToDevice(send.deviceJSON)
      if(this.device!=null){
        this.device.node.connect(send.device.node)
      }
      if(send && targetModule.device!=null){
        send.device.node.connect(targetModule.device.node)
        this.sends.push(send)
        return send
      }
      
    }

    get receives(){
      // get all sends targeting this module
      let arr = []
      // audioModules.forEach((m)=>{
      //   if(m.){

      //   }
      // })
      return arr
    }
  }

  const jsonToDevice = async (json) => {
    let response, patcher, device;   
    try {
        patcher = await json
        //console.log("patcher: ", patcher)
    } catch (err) {
        console.log(err)
    }
    
    // Create the device
    try {
        device = await RNBO.createDevice({ context, patcher });
        // console.log("params", device.parameters)
    } catch (err) {
        console.log("err", err) 
    }
    return device
  }

  const setup = async () => {
    let WAContext = window.AudioContext || window.webkitAudioContext;
    context = new WAContext();

    // Create gain node and connect it to audio output
    outputNode = context.createGain() //new Tone.Gain(1.0).toDestination();
    outputNode.connect(context.destination);
    let outputDevice = new AudioModule("AudioOut")
    audioModules.push(outputDevice)

    let testDevice = new AudioModule("TestTone")
    audioModules.push(testDevice)

    //create rnbo device for each audioModule
    for (let mod of audioModules){
      console.log(mod.name)
      mod.device = await jsonToDevice(mod.deviceJSON)
      console.log("device param: ", mod.device.parameters[0].name)
    }
    //connect
    outputDevice.device.node.connect(outputNode)
    // testDevice.device.node.connect(outputDevice.device.node)
  }
  
  const startAudio = () => {
    context.resume()
  }

   setup()

  return (
    <div style={{width: "100vw", height: "100vh"}} onClick={startAudio}>
      <Menu>
        <span>Add: </span>
        <AddModule onClick={()=>{audioModules.push(new AudioModule("TestTone"))}}>TestTone</AddModule>
      </Menu>
      <Matrix modules={audioModules} context={context} rnbo={RNBO}/>
    </div>
  );
}



export default App;

const AddModule = styled.span`
    border: 1px solid black;
    width: 50px;
    &:hover{
        cursor: pointer
    }
`

const Menu = styled.span`
    display: flex;
    flex-direction: column;
    gap: 5px;
`