import React, { Component } from 'react';
import Item from "./Item2";

//const items = []; //productid  name  quantity  returnQuantity imgSrc

class ItemList extends Component {
    constructor(props){
        super(props);
        this.state={
            view:'selectItem', //"selectReason" "summary"  a state to control render content
        }
        this.currItem = {
            productID:"",
            variantid:"",
            name: "",
            value:"",
            src: "",
            quantity: "",
            price:""
        }
        this.returnItems = [];
        this.handleSubmit = this.handleSubmit.bind(this)
    }

    handleSubmit(){
        this.props.setReturnList(this.returnItems)
        this.props.handleSubmit()
    }

    //get return items
    handleSelect(productidX, variantidX, nameX, valueX, srcX, quantityX, priceX){
        let findItem=false;
        this.currItem = {
            productID: productidX,
            variantid: variantidX,
            name: nameX,
            value: valueX,
            src: srcX,
            quantity: quantityX,
            price: priceX
        }

        //update return list
        //console.log(JSON.stringify(this.currItem))
            for (var i = 0;i<this.returnItems.length;i++){
                var temp = this.returnItems[i];
                if (temp.variantid == this.currItem.variantid){
                    this.returnItems.splice(i,1)
                }
            }
            for (var i = 0;i<this.currItem.value;i++){
                this.returnItems.push(this.currItem)
            }

    }
    render() { 
        return (
            <div className="ItemList">
                {this.props.items.map((item)=>{
                    return <Item item={item} step = {1} key={item.variantID} handleSelect={this.handleSelect.bind(this)}/>
                })}
                <button onClick={this.handleSubmit}>CONFIRM</button>
            </div>
         );  
    }
}

export default ItemList;