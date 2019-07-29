import React, { Component } from 'react';
import './universal.css'

class restartPop extends Component {
    constructor(props){
        super(props)
        this.state = {

        }

    }

    render(){
        return (
        <div className = 'popup'>
            <div className = 'popup_inner'>
                <div className = 'centre'>
                    <h2 className = 'r2'>Confirmation</h2>
                    <br/>
                    <p>If you proceed, your current return form will be deleted, and you will be able to submit a new return form. Are you sure you wish to proceed?</p>
                    <button className='r2cancel' onClick={this.props.closePopup}>No, keep my old return.</button>
                    <button className='r2delete' onClick={this.props.handleDelete}> Yes, begin my new return.</button>
                </div>
            </div>
        </div>
        )
    }
}

export default restartPop;