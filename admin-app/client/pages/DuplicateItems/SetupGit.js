import React, { Component } from 'react';
import {postCollection, getShopID, postFulfillmentService} from './Shopify';
import {postInstallTime} from './Firestore';

import getConfig from 'next/config';
const {publicRuntimeConfig} = getConfig();
const serveo_name = publicRuntimeConfig.API_URL;

const text = {
  textAlign: 'left',
}

import Button from '@material-ui/core/Button';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import DateTimePicker from 'material-ui-datetimepicker';
import DatePickerDialog from 'material-ui/DatePicker/DatePickerDialog'
import TimePickerDialog from 'material-ui/TimePicker/TimePickerDialog';

//Dynamic Setup Process, only runs if the brand accidentally deletes GIT and Orig Collection
class SetupGit extends Component {
  constructor(props){
    super(props);
    this.state = {
      isGitCollectSetup: props.gitCollectionId != 0,
      isOrigCollectSetup: props.origCollectionId != 0,
      isFulfillSetup: false,
      extSetState: props.extSetState,
      shop_id: null,
      install_time: null,
    }
    this.callbackGit = this.callbackGit.bind(this);
    this.callbackOrig = this.callbackOrig.bind(this);
    this.setShopID = this.setShopID.bind(this);
    getShopID(this.setShopID);

    const options = {
      method: 'get',
      headers: {
        'Accept': 'application/json, text/plain, */*',
        'Content-Type': 'application/json'
      },
    }
    fetch(`${serveo_name}/priceRule/all/`, options)
      .then((response) => {
        if(response.ok){return response.json()}
        else{throw Error(response.statusText)}
      })
      .then((data) => {
        console.log('ALL PRICE RULES: ', data);
      })
      .catch((error) => console.log(error))
  }

  setShopID(data){
    this.setState(
      {
        shop_id: data.shop_id,
        install_time: data.install_time,
      }
    )
  }

  setDate(dateTime){
    this.setState({install_time: dateTime})
    console.log("dateTime", dateTime);
    const body = {
      shop_id: this.state.shop_id,
      install_time: dateTime,
    }
    console.log("BODY: ", body)
    postInstallTime(body);
  }

  setup(){
    if (!this.state.isGitCollectSetup) {
      postCollection({
        "smart_collection": {
          "title": "Get it Today",
          "rules": [
            {
              "column": "title",
              "relation": "contains",
              "condition": "Get it Today"
            }
          ],
        }
      }, this.callbackGit)
    }
    if (!this.state.isOrigCollectSetup) {
      postCollection({
        "smart_collection": {
          "title": "Original",
          "rules": [
            {
              "column": "title",
              "relation": "not_contains",
              "condition": "Get it Today"
            }
          ],
        }
      }, this.callbackOrig)
    }
    postFulfillmentService();
  }

  callbackGit(data){
    this.state.extSetState({gitCollectionId: data.smart_collection.id})
  }

  callbackOrig(data){
    this.state.extSetState({origCollectionId: data.smart_collection.id})
  }

  render(props){
    return (
      <div>
        <h1>Something has went wront</h1>
        <h4>We will need to make the following changes to your store:</h4>
        <ol style={text}>
          {!this.state.isOrigCollectSetup&&<li>Product collection "Original" will be added to your store</li>}
          {!this.state.isGitCollectSetup&&<li>Product collection "Get it Today" will be added to your store</li>}
          <li>A Flindel fulfillment service for "Get it Today" products will be added to your store.</li>
        </ol>
        <div>
          <Button variant="contained" onClick={() => this.setup()} color="primary">Setup Now</Button>
        </div>
      </div>
    )
  }
}
export default SetupGit;
