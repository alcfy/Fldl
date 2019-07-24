import React from 'react';
import Item from './Item2'
/*
GET REASONS FOR RETURN AND CONFIRM EMAIL ON THIS PAGE
*/
class confirmOrder extends React.Component{
    constructor(props){
      super(props)
      this.state = {selectedEmail: 0, 
                    count:0, 
                    itemErrorMessage:'', 
                    errorMessage:'', 
                    emailToPrint: this.props.email,
                    //style for blackout out continue button until all reasons selected. like page 2 and 3
                    style: 'Blackout2',
                    //styles for the emails, visible/hidden, big/small
                    existingStyle: 'l3On',
                    newStyle: 'l3Off',
                    hiddenStyle:' l3Hidden',
                    existingStyleText: 'l3On',
                    newStyleText: 'l3Off',
                    emailCopy:''
                  }

      this.set0=this.set0.bind(this)
      this.set1=this.set1.bind(this)
      this.handleForward=this.handleForward.bind(this)
      this.handleSelect=this.handleSelect.bind(this)
      this.updateEmailCopy=this.updateEmailCopy.bind(this)
    }

    componentWillMount(){
      //on mount, see if it is an email address (or phone number) by checking for index of @
      if(this.props.email.indexOf('@')==-1){
        this.setState({selectedEmail:1,emailToPrint: ''})
      }
    }

    set0(){
      //setting state from radio button (either old or new email)
      if (this.state.emailToPrint!=''){
        //if they select the 'old' email, check if valid, switch styles to hide confirm email bar + make current bigger
        this.setState({selectedEmail: 0,existingStyle:'l3On',newStyle:'l3Off', hiddenStyle:'l3Hidden', newStyleText:'l3Off',existingStyleText:'l3On'})
      }
  }

  set1(){
    //setting state from radio button (either old or new email)
    //set the style to show the double confirmation etc
      this.setState({selectedEmail: 1,existingStyle:'l3Off', newStyle:'l3On',hiddenStyle:'l3On', existingStyleText:'l3Off',newStyleText:'l3On'})
  }

  //update email field for email confirmation field
  updateEmailCopy(e){
    this.setState({emailCopy:e.target.value})
  }

  //handle reason select
  async handleSelect(variantidX,reasonX, oldreasonX){
    if (oldreasonX == null || oldreasonX == '---'){
      await this.setState((prevState) => ({
        //count number of times they select reason to see if we can proceed
        count: prevState.count + 1
    })); 
    }
    else if (reasonX == '---'){
      await this.setState((prevState) => ({
        //if they set reason to empty, decrement count
        count: prevState.count -1
    }));
    }
    
    //feed back to master
    this.props.setReason(variantidX,reasonX,oldreasonX)

    //actually toggle the button style if all reasons/not enough are selected
    if (this.state.count == this.props.items.length){
        this.setState({style:'Submit2'})
    }
    else{
      this.setState({style:'Blackout2'})
    }
  }

  //handle submit (PRESS CONTINUE)
  handleForward(){
    if (this.state.count == this.props.items.length){
      this.setState({itemErrorMessage:''})
      //handle submit of form
      if (this.state.selectedEmail==1){
        //make sure the email entered is valid if they are entering new one
        if(this.props.newEmail.length < 6 || this.props.newEmail.indexOf(' ') !=-1 || this.props.newEmail.indexOf('@')==-1){
          this.setState({errorMessage: '*Please enter a valid email to continue*'})
        }
        else{
          //change state in IdentifyApp to render new page
          if(this.props.newEmail == this.state.emailCopy){
            this.props.updateEmail()
            this.props.updateforward()
          }
          else{
            this.setState({errorMessage: 'The emails you entered do not match.'})
          }
        }
      }
      else{
        //change state in IdentifyApp to render new page
          this.props.updateforward()
      }
    }
    else{
      this.setState({itemErrorMessage:'Please select a reason for return for all items.'})
    }

    }
    
    //flip the radio select if they start typing in their own email
    componentWillReceiveProps(){
      if(this.props.newEmail != ''){
        this.set1()
      }
    }

    render(){
        return(
            <div>
              <p className = 'errorMessage'>{this.state.itemErrorMessage}</p>
              <div className = 'itemListSmall'>
                <fieldset className = 'page2'>
                  <p className = 'orderHeader'>Order Number: {this.props.orderNum}</p>
                  <br/>
                      {this.props.items.map((item,index)=>{ 
                      return <Item step = {2} item={item} serveoname={this.props.serveoname} key={index}handleSelect={this.handleSelect.bind(this)}/>    
                      })} {/*show all items*/}
                </fieldset>
              <br/>
                <h3 className = 'emailHead'>Email Confirmation:</h3> {/* GET EMAIL INFO*/}
                <p className = 'errorMessage'>{this.state.errorMessage}</p>
                <form>
                  <div>
                    <p className = 'emailText'>
                    <label className = {this.state.existingStyle}>
                      Use existing email:
                      <br/>
                        <input readOnly className = {this.state.existingStyleText} type="text" value={this.state.emailToPrint} onClick = {this.set0} />
                    </label>
                    
                    <br/>
                    <label className = {this.state.newStyle}> 
                      Enter new email:    
                      <br/>
                      <input className = {this.state.newStyleText} type="text" value={this.props.newEmail} onClick = {this.set1} onChange={this.props.updatehandleChange('newEmail')} />
                    </label>
                    <br/>
                    <label className = {this.state.hiddenStyle}>
                      Re-enter email:
                      <br/>
                      <input className = 'l3On' type="text" value = {this.state.emailCopy} onChange = {this.updateEmailCopy}/>
                    </label>
                    </p>
                  </div>
                </form>
                </div>
                  <br/>
              <footer className = 'f1'>
                  <button className = {this.state.style} onClick = {this.handleForward}> CONTINUE </button> 
              </footer>
            </div>
        )
    }
}

export default confirmOrder