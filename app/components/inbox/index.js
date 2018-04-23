import React, { Component } from 'react';
import { FlatList, View, Image,
        TouchableOpacity } from 'react-native';
import styles from './styles';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as ReduxActions from '../../actions';
import { Actions } from 'react-native-router-flux';
import { List, ListItem } from 'react-native-elements';

class Inbox extends Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    componentDidMount() {
        this.props.getMessages();
        this.props.getCards();
    }

    SeparatedLine = () => {
        return (
          <View style = {styles.sepLine}/>
        );
    };

    render() {

      // array to be filled with valid pairs of sender and recievers
      var arr = [];

      // loop through all messages
      for (var i = 0, len = this.props.messages.length; i < len; i++) {

        // check array for to and from pair
        var present = false;

        // check existing pairs we've collected for duplicates
        for (var j = 0, len2 = arr.length; j < len2; j++ ) {

          // if to / from match an existing entry, set present to true
          if (arr[j].to === this.props.messages[i].to && arr[j].from === this.props.messages[i].from) {
            present = true;
          }
          if (arr[j].to === this.props.messages[i].from && arr[j].from === this.props.messages[i].to) {
            present = true;
          }
        }
        // now add message to array if combination not present
        if (present == false) {
          arr.push(this.props.messages[i])
        }
        else {
          // don't do anything because pair was already in array
        }
      }

        return (
            <View style = {styles.container}>
                <List containerStyle={{ borderTopWidth: 0, borderBottomWidth: 0 }}>
                    <FlatList
                        data={arr}
                        keyExtractor={item => item.id}
                        renderItem={this.renderItem}
                        ItemSeparatorComponent={this.SeparatedLine}
                    />
                </List>
            </View>
        );
    }

    renderItem = ({item, index}) => {
        /* get author name and portrait for each message */
        let author = item.from; //display public key if card not found
        let sender = null;
        let reciever = null;
        let portrait = 'https://www.mautic.org/media/images/default_avatar.png';
        for (card of this.props.cards) {
            // to find display name of reciever of message (owner == false)
            if (card.keys.n === item.to && card.owner === false) {
                author = card.name;
                // set for inbox to know who is who
                reciever = item.to;
                sender = item.from;

                if(card.image !== ""){
                    portrait = card.image;
                }
                break;
            }
            // to find display the contact of message (owner == false)
            if (card.keys.n === item.from && card.owner === false) {
                author = card.name;
                // set for inbox to know who is who
                reciever = item.from;
                sender = item.to;

                if(card.image !== ""){
                    portrait = card.image;
                }
                break;
            }
        };
        // object prop that is passed to message_thread
        let pair = {
          sender: sender,
          reciever: reciever
        }

        return (
            <TouchableOpacity  onPress={() => Actions.message_thread({pair: pair})} >
                <ListItem
                    roundAvatar
                    title = {author}
                    rightTitle = {new Date(item.time*1000).toDateString()}
                    subtitle = {item.body}
                    avatar = {{uri: portrait}}
                    containerStyle = {{borderBottomWidth: 0}}
                />
            </TouchableOpacity>
        );
    }

};

// The function takes data from the app current state,
// and insert/links it into the props of our component.
// This function makes Redux know that this component needs to be passed a piece of the state
function mapStateToProps(state, props) {
    return {
        messages: state.dataReducer.messages,
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
export default connect(mapStateToProps, mapDispatchToProps)(Inbox);
