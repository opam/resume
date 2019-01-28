import * as React from 'react';
import './share.css';
import * as FontAwesome from 'react-fontawesome';
import swal from 'sweetalert';

interface Props extends React.Props<any> {
    url:string;
    id: string;
}

export default class Share extends React.Component<Props, {}> {

    copyToClipboard = (id, callback) => {
     
        const copyTextEl = document.getElementById(id) as any;

        /* Select the text field */
        copyTextEl.select();
      
        /* Copy the text inside the text field */
        document.execCommand("copy");
      
        callback(copyTextEl);
    }

    onClick = (id) => {        
        this.copyToClipboard(id, (el)=>{
            swal("Great!", "You just sucessfully copied link into your clipBoard!", "success");
        });   
    }

    render(){
        if(!this.props.url) {
            return "";
        }

        const id = 'hidden_url_'+this.props.id;
        
        return (           
            <div 
                className="share-component" 
                title={"Click to get sharable link"} 
                onClick={()=>{this.onClick(id)}}
            >
                <FontAwesome name="share-alt"/>                
                <input type="text" className="link-holder" readOnly={true} value={this.props.url} id={id}/>             
                Share
            </div>
          
        )
    }
}