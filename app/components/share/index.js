/**
 * Create Share Function
 * by id.ly Team
 */

//Import Libraries
import React, { Component } from 'react';
import QRCode from 'react-native-qrcode';
import styles from './styles';
import { StyleSheet, FlatList, TextInput,
        View, Text, ActivityIndicator,
        TouchableHighlight,
        ActionSheetIOS} from 'react-native';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as ReduxActions from '../../actions'; //Import your actions
import {Actions} from 'react-native-router-flux';
import deviceInfo from 'react-native-device-info';
//import BluetoothCP from 'react-native-bluetooth-cross-platform';
let BluetoothCP = require("react-native-bluetooth-cross-platform")

// SHARE
// FUNCTION(S): This componenet at the moment will display a JSON card object in QR
// readable format (ommiting the private key if present).
//
// FUTURE FUNCTION(S): Display public key of card object bluetooth handshake
// would occur here and deliver the card object over that bridge.
//
// EXPECTED PROP(S): this.props.card
// This component will expect a card object to be passed to it when viewed so
// it knows what to card/key to display in QR/or send over bluetooth.
class Share extends Component {
    constructor(props) {
        super(props);
        this.state = {};
        this.packageCard = this.packageCard.bind(this);
        this.connectedListener = this.connectedListener.bind(this);
    }

    componentDidMount() {
        this.props.getCards();
        
        /* assign listeners so they can be unsubscribed on unmount */
        this.listener1 = BluetoothCP.addPeerDetectedListener((msg) => console.log(msg));
        this.listener2 = BluetoothCP.addPeerLostListener((msg) => console.log(msg));
        this.listener3 = BluetoothCP.addReceivedMessageListener((msg) => console.log(msg));
        this.listener4 = BluetoothCP.addInviteListener((r) => BluetoothCP.acceptInvitation(r.id));
        this.listener5 = BluetoothCP.addConnectedListener(this.connectedListener);

        console.log('share: mounted');
        console.log('share: advertising');
        BluetoothCP.advertise("BT");
    }
    
    inviteListener(peer) {
        /* code that runs when you are invited */
        console.log('addInviteListener', peer);
        console.log('accepting invitation');
        BluetoothCP.acceptInvitation(peer.id);
    }

    connectedListener(peer) {
        /* code that runs when you are connected */
        console.log('addConnectedListener', peer);
        console.log('sending message to ' + peer.id);
        BluetoothCP.sendMessage('hello ' + peer.id + ' this is ' + deviceInfo.getUniqueID(), peer.id);
        //BluetoothCP.disconnectFromPeer(peer.id);
        //Actions.pop();
    }

    componentWillUnmount() {
        this.listener1.remove();
        this.listener2.remove();
        this.listener3.remove();
        this.listener4.remove();
        this.listener5.remove();
        console.log('unmounting');
    }

    packageCard() {
        var jsonCard = JSON.stringify(this.props.card);
        var jsonCard2 = JSON.parse(jsonCard);
        console.log(jsonCard2)
        var jsonKey = jsonCard2.keys.n;
        console.log(jsonKey)
        jsonCard2.keys = {};
        //TODO: base64 too big for QR when we implement sending cards over bluetooth
        // get rid of this null
        jsonCard2.image = "";
        // omit private keys from share object
        jsonCard2.keys = {"n": jsonKey};
        // ensure card owner is set to false
        jsonCard2.owner = false;
        console.log('object to display in QR',jsonCard2)
        var res = JSON.stringify(jsonCard2);
        return res;
    }

    render() {
        // call packageCard() function to get card object ready for QR display
        // var packageCard = this.packageCard();
        // console.log(packageCard)
        let uuid = deviceInfo.getUniqueID();

        return (
            // This is where the actual QR is displayed
            <View style={styles.container}>
                <Text> unique id: {uuid} </Text>
                <Text style={styles.title}>
                    Have the other user scan with QR Scanner
                </Text>
                <QRCode
                    value={uuid}
                    size={350}
                    bgColor='black'
                    fgColor='white'
                />
            </View>
        );
    };
}

function mapStateToProps(state, props) {
    return {
        loading: state.dataReducer.loading,
        cards: state.dataReducer.cards
    }
}

// Doing this merges our actions into the component’s props,
// while wrapping them in dispatch() so that they immediately dispatch an Action.
// Just by doing this, we will have access to the actions defined in out actions file (action/home.js)
function mapDispatchToProps(dispatch) {
    return bindActionCreators(ReduxActions, dispatch);
}

//Connect everything
export default connect(mapStateToProps, mapDispatchToProps)(Share);

