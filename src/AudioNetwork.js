import {useEffect, useState} from 'react'
import * as Tone from 'tone'
import RNBO from '@rnbo/js'
import styled from 'styled-components'
import Matrix from './components/Matrix'
import require from 'requirejs'
import ControlPanel from './ControlPanel'
/*
  NO STATE 
    - modules and context both stored in variables
  setup function:
    - new context
    - new outputNode
    - new AudioModule for each selAudioModule (plus AudioOut)
    - new device for each AudioModule (async)
    - new send from & to each module



*/



const AudioNetwork = (props) => {
  const {selAudioModules, selControlModules} = props
  let WAContext = window.AudioContext || window.webkitAudioContext;
  let context = new WAContext();
  let outputNode
  let audioModules = [

  ]
  let controlModules = [

  ]
  let ctlIO = {
    inputs: {trig: [], mod: []}, 
    outputs: {trig: [], mod: []}
  }

  const countModuleType = (modules, type) => {
    let count = 0
    modules.forEach((mod)=>{
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
      this.deviceJSON = require('./patchers/AudioSend.export.json')
      this.device = null
    }
  }

  class Receive {
    constructor(sourceCtlOut, targetCtlIn){
      this.source = source
      this.target = target
      this.deviceJSON = require('./patchers/ModReceiver.export.json')
      this.device = null
    }
  }

  class AudioModule {
    constructor(type){
      this.type = type
      this.name = type+(countModuleType(audioModules, type) + 1)
      this.deviceJSON = require('./patchers/'+type+'.export.json')
      this.device = null
      this.sends = []
      this.ctlIO = {
        inputs: {trig: [], mod: []}, 
        outputs: {trig: [], mod: []}
      }
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

  class ControlOutput {
    constructor(module, type, name, outlet){
      this.type = type
      this.name = name
      this.outlet = outlet
      this.module = module
    }
    

  }
  class ControlInput {
    constructor(module, type, name, inlet, range){
      this.type = type
      this.name = name
      this.inlet = inlet
      this.module = module
      if(type=="mod"){
        this.range = range
      } else {
        this.range = null
      }
      this.receives = []
    }
    async receiveFrom(sourceCtlOut){ 
      let receive = new Receive(sourceCtlOut, this)
      receive.device = await jsonToDevice(receive.deviceJSON) 

      //connect receiver to module at inlet#
      if(receive.device!=null){
        receive.device.node.connect(this.module.device.node, 0, this.inlet)
      }

      //connect source to receiver from outlet# 
      if(sourceCtlOut.device!=null){
        sourceCtlOut.device.node.connect(receive.device.node, sourceCtlOut.outlet)
        this.receives.push(receive)
        return receive
      }

    }
  }

  class ControlModule {
    constructor(type){
      this.type = type
      this.name = type+(countModuleType(controlModules, type) + 1)
      this.deviceJSON = require('./patchers/'+type+'.export.json')
      this.device = null
      this.ctlIO = {
        inputs: {trig: [], mod: []}, 
        outputs: {trig: [], mod: []}
      }
      // this.sends = []
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

  const post = (x) => {
    console.log(x)
  }


  
  const setup = async () => {
    console.log("setup")
    // new context
    

    // new outputNode
    outputNode = new GainNode(context)
    outputNode.connect(context.destination);

    // new AudioModule for each selAudioModule (plus AudioOut)
    selAudioModules.forEach((mType)=>{
      audioModules.push(new AudioModule(mType))
    })
    audioModules.unshift(new AudioModule("AudioOut"))

    // new ControlModule for each selControlModule
    selControlModules.forEach((mType)=>{
      controlModules.push(new ControlModule(mType))
    })

    // new device for each AudioModule (async)
    for (let mod of audioModules){
      mod.device = await jsonToDevice(mod.deviceJSON)
      console.log('device added for: ', mod.name)
      if(mod.type=="Op"){
        mod.ctlIO.inputs.mod = [new ControlInput(mod, 'mod', 'amp', 1, [0, 1])]
        mod.ctlIO.inputs.mod = [new ControlInput(mod, 'mod', 'fb', 1, [0, 1])]

      } else if(mod.type=="Env"){
        mod.ctlIO.outputs.trig= [new ControlOutput(mod, 'trig', 'endFlag', 2)]
        mod.ctlIO.inputs.trig = [new ControlInput(mod, 'trig', 'trigger', 1)]
      }

    }
    // new device for each ControlModule (async)
    for (let mod of controlModules){
      mod.device = await jsonToDevice(mod.deviceJSON)
      console.log('device added for: ', mod.name)
      let modIns = mod.ctlIO.inputs
      let modOuts = mod.ctlIO.outputs
      //in this^ case mod means module, not modulation like below

      if(mod.type=="Trigger"){
        modOuts.trig = [new ControlOutput(mod, 'trig', 'out', 1)]
      } else if(mod.type=="Env"){
        modOuts.trig= [new ControlOutput(mod, 'trig', 'endFlag', 2)]
        modIns.trig = [new ControlInput(mod, 'trig', 'trigger', 1)]
      } else if(mod.type=="TestEnv"){
        modOuts.mod= [new ControlOutput(mod, 'mod', 'out', 2)]
        modIns.trig = [new ControlInput(mod, 'trig', 'trigger', 1)]
      }
      else {

      }
      //add mod io to global io object
      if(modIns.trig.length>0) {
        ctlIO.inputs.trig = [...ctlIO.inputs.trig, modIns.trig]
      }
      if(modIns.mod.length>0) {
        ctlIO.inputs.mod = [...ctlIO.inputs.mod, modIns.mod]
      }
      if(modOuts.trig.length>0) {
        ctlIO.outputs.trig = [...ctlIO.outputs.trig, modOuts.trig]
      }
      if(modOuts.mod.length>0) {
        ctlIO.outputs.mod = [...ctlIO.outputs.mod, modOuts.mod]
      }
      post('modIns and modOuts:', modIns, modOuts)
    }

    //add ControlOutputs to every ControlModule (specific to the module type)

    
    //add ControlInputs to every nqParam and trigInput (these will be in both Control AND Audio modules) 

    //put I/Os in global arrays and pass them to <Matrix/> and <ControlPanel/>
    

    // AudioOut->outputNode
    let audioOut = audioModules.find((m)=>m.type==="AudioOut")
    audioOut.device.node.connect(context.destination)//outputNode)

  }

  /*
  NO STATE 
    - modules and context both stored in variables
  setup function:
    - new context
    - new outputNode
    - new AudioModule for each selAudioModule (plus AudioOut)
    - new device for each AudioModule (async)
    - new send from & to each module
    - connect sends  
    - AudioOut->outputNode



*/

  const startAudio = () => {
    context.resume()
  }



  setup()

  return (
    <div style={{width: "100vw", height: "100vh"}} onClick={startAudio}>
      <Matrix modules={audioModules} controlModules={controlModules} ctlIO={ctlIO} context={context} rnbo={RNBO}/>
      <ControlPanel audioModules={audioModules} controlModules={controlModules} ctlIO={ctlIO} context={context} rnbo={RNBO}/>
    </div>
  );
}

export default AudioNetwork;

export const SourceSelector = (props) => {
  const {ctlOut}
  const [enabled, setEnabled] = useState(false)
  
  return (
    (enabled ? 
      <button onClick={}>sel</button>
    :
    )
    <div>ControlPanel</div>
  )
}
