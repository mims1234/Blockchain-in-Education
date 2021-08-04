import React, { Component } from 'react';
import Web3 from 'web3';
import Univ from '../abis/Univ.json'
import './App.css';

const ipfsClient = require('ipfs-http-client')
const ipfs = ipfsClient({ host: 'ipfs.infura.io', port: 5001, protocol: 'https' }) // leaving out the arguments will default to these values

class App extends Component {

  async componentWillMount() {
    await this.loadWeb3()
    await this.loadBlockchainData()
  }

  async loadNothing() {
    window.alert('Did Nothing Test')
  }

  async loadWeb3() {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum)
      await window.ethereum.enable()
    }
    else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider)
    }
    else {
      window.alert('Non-Ethereum browser detected. You should consider trying MetaMask!')
    }
  }

  async loadBlockchainData() {
    const web3 = window.web3
    // Load account
    const accounts = await web3.eth.getAccounts()
    this.setState({ account: accounts[0] })
    const networkId = await web3.eth.net.getId()
    const networkData = Univ.networks[networkId]
    if(networkData) {
      const contract = web3.eth.Contract(Univ.abi, networkData.address)
      this.setState({ contract })
      // const degreeHash = await contract.methods.get().call()
      const owner = await contract.methods.getOwenerAddress().call()
      // this.setState({ degreeHash })
      this.setState({owner})
      this.setState({ buffer: false })
      var DegCounts = await contract.methods.degreeCounts().call()
      var ok = null;
      var listStruct = []
      var MylistStruct = [];
      for(var i=1;i<=DegCounts;i++){
        ok = await contract.methods.sharelist(i).call()
        await listStruct.push(ok)
        if(ok.studentAddress===this.state.account) await MylistStruct.push(ok)
        ok = null;
      }

      await this.setState({listStruct})
      await this.setState({MylistStruct})

      var shareDevViewListArray = []
      var DegreeData = listStruct
      DegreeData.map(async(i) =>{
        var DegreeShareArrayView =  await this.state.contract.methods.returnShareList(i.ipfsHASH).call()
        DegreeShareArrayView.map((d) =>{
          if(this.state.account===d){
            shareDevViewListArray.push(i)
          }
        })
      })

      await this.setState({shareDevViewList:shareDevViewListArray})

      console.log(this.state.shareDevViewList)
      // console.log(`lastupload: ${o1}`)
      // console.log(parseInt(this.state.listStruct[0].id,10))
      // console.log(`Menu Option: ${this.state.menuOption}`)
    } else {
      window.alert('Smart contract not deployed to detected network.')
    }
  }

  

  constructor(props) {
    super(props);

    this.state = {
      shareDegList:[],
      shareDevViewList:[],
      listStruct:[],
      MylistStruct:[],
      menuOption:0,
      degreeHash: null,
      studentname: '',
      studenthash: '',
      contract: null,
      web3: null,
      buffer: null,
      account: null,
      owner:null,
      confirm: true,
      Univ_Student_Address:'',
      Univ_Student_Name:'',
      Univ_Std_Address:'',
      Univ_Std_DegYear:'',
      Univ_Std_DegHash:'',
      Univ_Std_DegName:'',
      Std_IPFS_SEARCH:'',
      Std_Share_Address:'',
      Std_Share_IPFS:''
    }

    this.handleChange_Univ_Student_Name = this.handleChange_Univ_Student_Name.bind(this);
    this.handleChange_Univ_Student_Address = this.handleChange_Univ_Student_Address.bind(this);
    this.handleChange_Univ_Std_DegYear = this.handleChange_Univ_Std_DegYear.bind(this);
    this.handleChange_Univ_Std_Address = this.handleChange_Univ_Std_Address.bind(this);
    this.handleChange_Univ_Std_DegName = this.handleChange_Univ_Std_DegName.bind(this);
    this.handleChange_Std_IPFS_SEARCH = this.handleChange_Std_IPFS_SEARCH.bind(this);
    this.handleOptionMenu0 = this.handleOptionMenu0.bind(this);
    this.handleOptionMenu1 = this.handleOptionMenu1.bind(this);
    this.handleOptionMenu2 = this.handleOptionMenu2.bind(this);
    this.handleChange_Std_Share_Address = this.handleChange_Std_Share_Address.bind(this);
  }

  captureFile = (event) => {
    event.preventDefault()
    console.log(event.target.files.length)
    const file = event.target.files[0]
    const reader = new window.FileReader()
    reader.readAsArrayBuffer(file)
    reader.onloadend = () => {
      this.setState({ buffer: Buffer(reader.result) })
      console.log('buffer', this.state.buffer)
    }
  }

  // Admission
  handleChange_Univ_Student_Name(event) {
    this.setState({Univ_Student_Name: event.target.value});
  }
  handleChange_Univ_Student_Address(event) {
    this.setState({Univ_Student_Address: event.target.value});
  }
  onSubmitAddmission = (event) => {
    event.preventDefault()
    this.state.contract.methods.admission(this.state.Univ_Student_Name,this.state.Univ_Student_Address).send({ from: this.state.account })
  }

  // Certificate Generation
  handleChange_Univ_Std_DegYear(event) {
    this.setState({Univ_Std_DegYear: event.target.value});
  }
  handleChange_Univ_Std_Address(event) {
    this.setState({Univ_Std_Address: event.target.value});
  }
  handleChange_Univ_Std_DegName(event) {
    this.setState({Univ_Std_DegName: event.target.value});
  }
  onSubmit = async(event) => {
    event.preventDefault()

    console.log("Submitting file to ipfs...")
    ipfs.add(this.state.buffer, (error, result) => {
      console.log('Ipfs result', result)
      if(error) {
        console.error(error)
        return
      }

      // UNCOMMENT THIS ONCE U ADD THE FIELDS
       this.state.contract.methods.upload(this.state.Univ_Std_DegName,this.state.Univ_Std_DegYear,`"${result[0].hash}"`,this.state.Univ_Std_Address,`"${result[0].hash}"`).send({ from: this.state.account })
      //  this.state.contract.methods.get().call().then(
      //   this.setState({ confirm: true }))
      //  this.setState({ degreeHash: result[0].hash })
    })
    // await this.setState({ Univ_Std_DegYear: '' })
    // await this.setState({ Univ_Std_Address: '' })
    // await this.setState({ Univ_Std_DegName: '' })
  }

  // Search Options
  handleChange_Std_IPFS_SEARCH(event) {
    this.setState({Std_IPFS_SEARCH: event.target.value});
  }
  onSearch = (event) => {
    event.preventDefault()
    this.state.contract.methods.admission(this.state.Univ_Student_Name,this.state.Univ_Student_Address).send({ from: this.state.account })
  }

  // Privacy Setting Options
  CheckPrivacySettingsForDegree = (event) => {
    event.preventDefault()
    if(event.target.value==="false"){
      alert("This document is currently Set to Private")
    } else {
      alert("This document is currently Set to Public")
    }
  }

  ChangePrivacySettingsForDegree = (event) => {
    event.preventDefault()
    var args = event.target.value
    this.state.contract.methods.viewDocVisibility(`${args}`).send({ from: this.state.account })
  }

  // Share 
  handleChange_Std_Share_Address(event) {
    this.setState({Std_Share_Address: event.target.value});
  }
  onShareAddress = async(event) => {
    event.preventDefault()
    this.state.contract.methods.share(this.state.Std_Share_IPFS,this.state.Std_Share_Address).send({ from: this.state.account })
    await this.setState({Std_Share_IPFS:''})
    await this.setState({Std_Share_Address:''})
  }

  ShareDocumentPage = async(event) => {
    event.preventDefault()
    this.handleOptionMenu2()
    var args = event.target.value.split(',')
    var MyDeg = this.state.MylistStruct
    var DegreeShareArray =  await this.state.contract.methods.returnShareList(MyDeg[parseInt(args[1])].ipfsHASH).call()
    await this.setState({shareDegList:DegreeShareArray})
    await this.setState({Std_Share_IPFS:MyDeg[parseInt(args[1])].ipfsHASH})
  }

  // Shared List View
  SharedListViewPage = async(event) => {
    event.preventDefault()
    this.handleOptionMenu1()
  }

  // Navigation for Users
  handleOptionMenu0(){ this.setState({menuOption:0}) }
  handleOptionMenu1(){ this.setState({menuOption:1}) }
  handleOptionMenu2(){ this.setState({menuOption:2}) }


  render() {
    const MyListData = this.state.MylistStruct;
    const MyShareDegData = this.state.shareDegList;
    const MyViewSharedDeg = this.state.shareDevViewList;
    // MyListData.map((i) => console.log(i.degree_name))
    var MyDegreeView = <div>TEST</div>
    var OtherDegreeView = <div>TEST</div>
    var OtherDegreeListView = <div>TEST</div>
    var DocumentShareView = <div>TEST</div>
    var DocumentShareListView = <div>TEST</div>
    var DisplayContent = <div>TEST</div>
    var Display = <div>TEST</div>

    if(MyListData.length>0){
        MyDegreeView = MyListData.map((i,index) => 
        <div>
        <h3>{i.degree_name}</h3>
          <a
            href={`https://ipfs.infura.io/ipfs/${i.ipfsHASH.replace(/['"']+/g,'')}`}
            onClick={this.documentloading}
            target="_blank"
            rel="noopener noreferrer"
          > 
            <button className="btn btn-primary btn-sm">View</button>
          </a>
        
        <button className="btn btn-warning btn-sm" value={`${i.visibility}`} onClick={this.CheckPrivacySettingsForDegree}>Check Privacy</button>
        <button className="btn btn-danger btn-sm" value={`${i.ipfsHASH}`} onClick={this.ChangePrivacySettingsForDegree}>Change Privacy</button>
        <button className="btn btn-success btn-sm" value={`${i.id},${index}`} onClick={this.ShareDocumentPage}>Share Option</button>
        </div>
      )
    } else {
      MyDegreeView = <div>You Have Not Completed any Degree at this University</div>
    }

    OtherDegreeView = <div>YYet to Make</div>

    if(MyShareDegData.length<=0){
      DocumentShareListView = <div>This Document If is set to Private it is not been shared with anyone</div>
    } else {
    
      DocumentShareListView = MyShareDegData.map((j,index) =>
        <div>
                <p>Address: {j}</p>
                <hr></hr>
        </div>
      )
    }

    if(MyViewSharedDeg.length<=0){
      OtherDegreeView = <div>No one has shared any document with you</div>
      // console.log(MyViewSharedDeg.length)
      MyViewSharedDeg.map((j,index) =>
      console.log(j)
      )
      console.log(this.state.shareDevViewList.length)
    } else {
    
      OtherDegreeView = MyViewSharedDeg.map((j,index) =>
        <div>
          <h3>{j.degree_name} | Address: {j.studentAddress}</h3>
            <a
              href={`https://ipfs.infura.io/ipfs/${j.ipfsHASH.replace(/['"']+/g,'')}`}
              onClick={this.documentloading}
              target="_blank"
              rel="noopener noreferrer"
            > 
              <button className="btn btn-primary btn-sm">View</button>
            </a>
        </div>
      )
    }

    DocumentShareView = 
    <div>
        <form onSubmit={this.onShareAddress}>
            <label>Share Address: 
              <input className="Labels" type='text' value={this.state.Std_Share_Address} placeholder="Enter Share Address" onChange={this.handleChange_Std_Share_Address} required/>
            </label>
            <br></br>

            <br></br>
            <input id="admission_submit" type='submit' />
        </form>
        <hr></hr>
        {DocumentShareListView}
    </div>

    if(this.state.menuOption===0) DisplayContent=MyDegreeView
    if(this.state.menuOption===1) DisplayContent=OtherDegreeView
    if(this.state.menuOption===2) DisplayContent=DocumentShareView


    var OwnerCheck = 
        <div>
            <div>
              <nav className="navbar navbar-dark fixed-top bg-dark flex-md-nowrap p-0 shadow">
                <a
                  className="navbar-brand col-sm-3 col-md-2 mr-0"
                  href="#"
                  rel="noopener noreferrer"
                >
                  University Admin : {this.state.account}
                </a>
            </nav>
          </div>
          <div className="container-fluid mt-5">
           <div className="row">
             <main role="main" className="col-lg-12 d-flex text-center">
               <div className="content mr-auto ml-auto">
                    <hr></hr>
                    <h2><u>ADMISSION</u></h2>
                    <hr></hr>
                    <br></br>
                      <form onSubmit={this.onSubmitAddmission} >
                          <label>Student Name: 
                            <input className="Labels" type='text' value={this.state.Univ_Student_Name} placeholder="Enter Student Name" onChange={this.handleChange_Univ_Student_Name} required/>
                          </label>
                          <br></br>
                          <label>Student Address: 
                            <input className="Labels" type='text' value={this.state.Univ_Student_Address} placeholder="Enter Student Address" onChange={this.handleChange_Univ_Student_Address} required/>
                          </label>
                          <br></br>
                          <input id="admission_submit" type='submit' />
                      </form>
                    <hr></hr>
                    <h2><u>DEGREE CERTIFICATE GENERATION</u></h2>
                    <hr></hr>
                      <form onSubmit={this.onSubmit} >
                            <label>Select Document: 
                            <input className="Labels" type='file' onChange={this.captureFile} placeholder="Select Document" multiple required/>
                            </label>
                            <br></br>
                            <label>Degree Name: 
                              <input className="Labels" type='text' value={this.state.Univ_Std_DegName} placeholder="Enter Degree Name" onChange={this.handleChange_Univ_Std_DegName} required/>
                            </label>
                            <br></br>
                            <label>Student Address: 
                              <input className="Labels" type='text' value={this.state.Univ_Std_Address} placeholder="Enter Student Address" onChange={this.handleChange_Univ_Std_Address} required/>
                            </label>
                            <br></br>
                            <label>Year: 
                              <input className="Labels" type='text' value={this.state.Univ_Std_DegYear} placeholder="Enter Year" onChange={this.handleChange_Univ_Std_DegYear} required/>
                            </label>
                            <br></br>
                            <input id="admission_submit" type='submit' />
                        </form>
                    <hr></hr>
                          <a href="javascript:history.go(0)">Click to refresh the page</a>
                    <hr></hr>
               </div>
             </main>
           </div>
         </div>
        </div>
    var RestCheck = 
      <div>
          <div>
            <nav className="navbar navbar-dark fixed-top bg-dark flex-md-nowrap p-0 shadow">
              <a
                className="navbar-brand col-sm-3 col-md-2 mr-0"
                href="#"
                rel="noopener noreferrer"
              >
                Welcome, {this.state.account}
              </a>
          </nav>
        </div>
        <div className="container-fluid mt-5">
        <div className="row">
          <main role="main" className="col-lg-12 d-flex text-center">
            <div className="content mr-auto ml-auto">
              {/* <input className="Labels" type='text' value={this.state.Std_IPFS_SEARCH} placeholder="Enter Degree Name" onChange={this.handleChange_Std_IPFS_SEARCH} required/>
              <button type="button" class="btn btn-danger">Search</button> */}
              <hr></hr>
              {/* <p>{await this.state.contract.methods.getOwenerAddress().call()}</p> */}
              <button type="button" className="btn btn-primary"  onClick={this.handleOptionMenu0}>My Degree</button>
              <button type="button" className="btn btn-success"  onClick={this.SharedListViewPage}>Share Degree</button>
              <hr></hr>
              {DisplayContent}
              {/* {MyDegreeView} */}
            </div>
          </main>
        </div>
      </div>
    </div>

    // console.log(`${this.state.account} || ${this.state.owner}`)
    if(this.state.account === this.state.owner){    
        Display = OwnerCheck;
    } else {
      Display = RestCheck;
    }

    return (
      <div>
            {Display}
      </div>
    )
  }

  // render() {
  //   var conditional = <p>Submit a PDF</p>
  //   var done = <p></p>
  //   if(this.state.degreeHash !== null){
  //     conditional = <div>
  //         <h3>Click on the Link or the Button to view the Document</h3>
  //         <hr></hr>
  //         <a
  //           href={`https://ipfs.infura.io/ipfs/${this.state.degreeHash}`}
  //           onClick={this.documentloading}
  //           target="_blank"
  //           rel="noopener noreferrer"
  //         > 
  //           <button className="btn btn-primary btn-sm">View</button>
  //         </a>
  //           <hr></hr>
  //           <h3>OR</h3>
  //           <hr></hr>
  //           <a href={`https://ipfs.infura.io/ipfs/${this.state.degreeHash}`}
  //              target="_blank"
  //              rel="noopener noreferrer"
  //           >
  //             {`https://ipfs.infura.io/ipfs/${this.state.degreeHash}`}
  //           </a>
  //       </div>

  //     if(this.state.confirm == true){
  //       done = <a href="javascript:history.go(0)">Click to refresh the page</a>         
  //     }
  //   }
  //    // eslint-disable-next-line
  //   return (
  //     <div>
  //       <nav className="navbar navbar-dark fixed-top bg-dark flex-md-nowrap p-0 shadow">
  //         <a
  //           className="navbar-brand col-sm-3 col-md-2 mr-0"
  //           href="#"
  //           rel="noopener noreferrer"
  //         >
  //           {this.state.account}
  //         </a>
  //       </nav>
  //       <div className="container-fluid mt-5">
  //         <div className="row">
  //           <main role="main" className="col-lg-12 d-flex text-center">
  //             <div className="content mr-auto ml-auto">
  //               {conditional}
                
  //               <p>&nbsp;</p>
  //               <h2>Upload Degree</h2>
  //               <p>&nbsp;</p>
  //               <form onSubmit={this.onSubmit} >
  //                 <input type='file' onChange={this.captureFile} multiple/>
  //                 {/* <input type='text' placeholder="Student Name" required/>
  //                 <input type='text' placeholder="Student Hash" required/> */}
  //                 <input type='submit' />
  //                 <hr></hr>
  //                 <a href="javascript:history.go(0)">Click to refresh the page</a>
  //               </form>
  //             </div>
  //           </main>
  //         </div>
  //       </div>
  //     </div>
  //   );
  // }
}

export default App;
